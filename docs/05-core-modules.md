# 核心模块代码模板

> 常用功能模块的标准实现，可直接复制使用或作为参考。

---

## 一、认证插件模板（Hapi.js）

```javascript
// plugins/auth.js
import Boom from '@hapi/boom';

/**
 * 注册认证插件
 * @param {object} server - Hapi 服务器实例
 * @param {object} sessionStore - 会话存储服务
 */
export const registerAuth = async (server, sessionStore) => {
  // 定义 Bearer Token 认证方案
  server.auth.scheme('session-bearer', () => ({
    authenticate: async (request, h) => {
      // 1. 提取 Token
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw Boom.unauthorized('缺少认证凭证');
      }
      const token = authHeader.slice(7);

      // 2. 验证会话
      const session = await sessionStore.getSession(token);
      if (!session) {
        throw Boom.unauthorized('会话不存在或已失效');
      }
      if (session.status !== 'active') {
        throw Boom.unauthorized('会话已被禁用');
      }

      // 3. 检查过期时间
      if (new Date(session.expire_at) < new Date()) {
        await sessionStore.deleteSession(token);
        throw Boom.unauthorized('会话已过期');
      }

      // 4. 返回认证信息
      return h.authenticated({
        credentials: {
          token,
          userId: session.user_id,
          userType: session.user_type,
          tenantId: session.tenant_id,
          roles: session.roles || [],
          permissions: session.permissions || [],
          session,
        },
      });
    },
  }));

  // 注册认证策略
  server.auth.strategy('session', 'session-bearer');

  // 权限检查钩子
  server.ext('onPreHandler', (request, h) => {
    const permMeta = request.route.settings.plugins?.permission;
    if (!permMeta) return h.continue;

    const { credentials } = request.auth;

    // 超级管理员放行
    if (Number(credentials.userId) === 1) return h.continue;

    // 检查权限
    const requiredPerm = `${permMeta.resource}:${permMeta.action}`;
    if (!credentials.permissions.includes(requiredPerm)) {
      throw Boom.forbidden('无操作权限');
    }

    return h.continue;
  });
};
```

---

## 二、路由定义模板

```javascript
// routes/user.js
import Joi from 'joi';
import { ok } from '../utils/response.js';

/**
 * 注册用户相关路由
 */
export const registerUserRoutes = (server, { userService }) => {
  // 获取用户列表
  server.route({
    method: 'GET',
    path: '/users',
    options: {
      auth: 'session',
      plugins: {
        permission: { resource: 'user', action: 'list' },
      },
      validate: {
        query: Joi.object({
          page: Joi.number().min(1).default(1),
          size: Joi.number().min(1).max(100).default(20),
          keyword: Joi.string().allow('').optional(),
          status: Joi.number().valid(0, 1).optional(),
        }),
      },
    },
    handler: async (request) => {
      const result = await userService.listUsers(request.query);
      return ok(result);
    },
  });

  // 获取单个用户
  server.route({
    method: 'GET',
    path: '/users/{id}',
    options: {
      auth: 'session',
      plugins: {
        permission: { resource: 'user', action: 'read' },
      },
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
    handler: async (request) => {
      const user = await userService.getUserById(request.params.id);
      return ok(user);
    },
  });

  // 创建用户
  server.route({
    method: 'POST',
    path: '/users',
    options: {
      auth: 'session',
      plugins: {
        permission: { resource: 'user', action: 'create' },
      },
      validate: {
        payload: Joi.object({
          username: Joi.string().min(3).max(64).required(),
          password: Joi.string().min(8).max(128).required(),
          display_name: Joi.string().max(64).optional(),
          email: Joi.string().email().optional(),
          role_ids: Joi.array().items(Joi.number()).optional(),
        }),
      },
    },
    handler: async (request) => {
      const user = await userService.createUser(request.payload);
      return ok(user, '创建成功');
    },
  });

  // 更新用户
  server.route({
    method: 'PUT',
    path: '/users/{id}',
    options: {
      auth: 'session',
      plugins: {
        permission: { resource: 'user', action: 'update' },
      },
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
        payload: Joi.object({
          display_name: Joi.string().max(64).optional(),
          email: Joi.string().email().optional(),
          status: Joi.number().valid(0, 1).optional(),
          role_ids: Joi.array().items(Joi.number()).optional(),
        }),
      },
    },
    handler: async (request) => {
      const user = await userService.updateUser(
        request.params.id,
        request.payload
      );
      return ok(user, '更新成功');
    },
  });

  // 删除用户（软删除）
  server.route({
    method: 'DELETE',
    path: '/users/{id}',
    options: {
      auth: 'session',
      plugins: {
        permission: { resource: 'user', action: 'delete' },
      },
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
    handler: async (request) => {
      await userService.deleteUser(request.params.id);
      return ok(null, '删除成功');
    },
  });
};
```

---

## 三、服务层模板

```javascript
// services/userService.js
import bcrypt from 'bcrypt';
import Boom from '@hapi/boom';
import { Op } from 'sequelize';

export class UserService {
  constructor({ models, sequelize }) {
    this.User = models.User;
    this.Role = models.Role;
    this.UserRole = models.UserRole;
    this.sequelize = sequelize;
  }

  /**
   * 获取用户列表
   */
  async listUsers({ page, size, keyword, status }) {
    const where = { deleted_at: null };

    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { display_name: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await this.User.findAndCountAll({
      where,
      limit: size,
      offset: (page - 1) * size,
      order: [['id', 'DESC']],
      attributes: { exclude: ['password_hash'] },
    });

    return {
      list: rows,
      total: count,
      page,
      size,
    };
  }

  /**
   * 获取单个用户
   */
  async getUserById(id) {
    const user = await this.User.findOne({
      where: { id, deleted_at: null },
      attributes: { exclude: ['password_hash'] },
      include: [{ model: this.Role, as: 'roles' }],
    });

    if (!user) {
      throw Boom.notFound('用户不存在');
    }

    return user;
  }

  /**
   * 创建用户
   */
  async createUser({ username, password, display_name, email, role_ids }) {
    // 检查用户名重复
    const exists = await this.User.findOne({
      where: { username, deleted_at: null },
    });
    if (exists) {
      throw Boom.conflict('用户名已存在');
    }

    // 事务创建
    const result = await this.sequelize.transaction(async (t) => {
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await this.User.create(
        {
          username,
          password_hash: passwordHash,
          display_name: display_name || username,
          email,
          status: 1,
        },
        { transaction: t }
      );

      // 分配角色
      if (role_ids?.length) {
        await this.UserRole.bulkCreate(
          role_ids.map((roleId) => ({
            user_id: user.id,
            role_id: roleId,
          })),
          { transaction: t }
        );
      }

      return user;
    });

    return { id: result.id, username: result.username };
  }

  /**
   * 更新用户
   */
  async updateUser(id, { display_name, email, status, role_ids }) {
    const user = await this.User.findOne({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw Boom.notFound('用户不存在');
    }

    await this.sequelize.transaction(async (t) => {
      // 更新基本信息
      await user.update(
        { display_name, email, status },
        { transaction: t }
      );

      // 更新角色
      if (role_ids !== undefined) {
        await this.UserRole.destroy({
          where: { user_id: id },
          transaction: t,
        });

        if (role_ids.length) {
          await this.UserRole.bulkCreate(
            role_ids.map((roleId) => ({
              user_id: id,
              role_id: roleId,
            })),
            { transaction: t }
          );
        }
      }
    });

    return { id, username: user.username };
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(id) {
    const user = await this.User.findOne({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw Boom.notFound('用户不存在');
    }

    // 防止删除超级管理员
    if (id === 1) {
      throw Boom.forbidden('不能删除超级管理员');
    }

    await user.update({ deleted_at: new Date() });
  }
}
```

---

## 四、数据库迁移模板

```javascript
// lib/dbMigrate.js
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const SQL_DIR = path.resolve(import.meta.dirname, '../../sql');

// 基础 schema 脚本（按顺序执行）
const SCHEMA_SCRIPTS = [
  'schema_phase1_base.sql',
  'schema_phase2_business.sql',
];

/**
 * 执行数据库迁移
 */
export const runMigrations = async (config) => {
  if (process.env.DB_MIGRATE_AUTO === '0') {
    console.log('[migrate] 自动迁移已禁用');
    return;
  }

  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true,
  });

  try {
    console.log('[migrate] 开始执行迁移...');

    // 确保迁移记录表存在
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 执行基础 schema
    for (const name of SCHEMA_SCRIPTS) {
      await executeSqlFile(conn, name);
    }

    // 执行增量 migrations
    const migrationDir = path.join(SQL_DIR, 'migrations');
    if (fs.existsSync(migrationDir)) {
      const files = fs
        .readdirSync(migrationDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const name of files) {
        await executeSqlFile(conn, `migrations/${name}`);
      }
    }

    console.log('[migrate] 迁移完成');
  } finally {
    await conn.end();
  }
};

/**
 * 执行单个 SQL 文件
 */
async function executeSqlFile(conn, name) {
  // 检查是否已执行
  const [rows] = await conn.execute(
    'SELECT 1 FROM schema_migrations WHERE name = ?',
    [name]
  );
  if (rows.length > 0) {
    return; // 已执行，跳过
  }

  // 读取并执行 SQL
  const filePath = path.join(SQL_DIR, name);
  if (!fs.existsSync(filePath)) {
    console.warn(`[migrate] 文件不存在: ${name}`);
    return;
  }

  const sql = fs.readFileSync(filePath, 'utf-8');
  console.log(`[migrate] 执行: ${name}`);

  await conn.query(sql);

  // 记录执行
  await conn.execute(
    'INSERT INTO schema_migrations (name) VALUES (?)',
    [name]
  );
}
```

---

## 五、后台 Worker 模板

```javascript
// workers/taskWorker.js
import { Op } from 'sequelize';

/**
 * 启动任务处理 Worker
 *
 * 特性：
 * - 抢占式任务分配（支持多实例）
 * - 指数退避重试
 * - 超时任务自动回收
 */
export const startTaskWorker = ({
  models,
  intervalMs = 5000,
  batchSize = 10,
  maxRetries = 5,
  backoffMs = [60_000, 120_000, 300_000, 600_000, 1_800_000],
  processTask,
}) => {
  const { Task } = models;
  let running = true;

  const tick = async () => {
    if (!running) return;

    try {
      const now = new Date();

      // 1. 回收卡住的任务（超过 5 分钟未更新）
      const reclaimBefore = new Date(now.getTime() - 5 * 60 * 1000);
      await Task.update(
        { status: 'pending' },
        {
          where: {
            status: 'processing',
            updated_at: { [Op.lte]: reclaimBefore },
          },
        }
      );

      // 2. 拉取待执行任务
      const tasks = await Task.findAll({
        where: {
          status: 'pending',
          next_retry_at: { [Op.lte]: now },
          retry_count: { [Op.lt]: maxRetries },
        },
        limit: batchSize,
        order: [['next_retry_at', 'ASC']],
      });

      // 3. 抢占式处理
      for (const task of tasks) {
        // 乐观锁抢占
        const [claimed] = await Task.update(
          { status: 'processing', updated_at: now },
          { where: { id: task.id, status: 'pending' } }
        );
        if (claimed !== 1) continue; // 被其他实例抢占

        try {
          // 执行任务
          await processTask(task);

          // 标记成功
          await Task.update(
            { status: 'completed', completed_at: new Date() },
            { where: { id: task.id } }
          );
        } catch (err) {
          console.error(`[Worker] 任务 ${task.id} 执行失败:`, err.message);

          // 计算下次重试时间
          const retryCount = task.retry_count + 1;
          const delay = backoffMs[Math.min(retryCount - 1, backoffMs.length - 1)];
          const nextRetry = new Date(now.getTime() + delay);

          await Task.update(
            {
              status: retryCount >= maxRetries ? 'failed' : 'pending',
              retry_count: retryCount,
              next_retry_at: nextRetry,
              last_error: err.message,
            },
            { where: { id: task.id } }
          );
        }
      }
    } catch (err) {
      console.error('[Worker] 执行出错:', err);
    }
  };

  // 启动定时器
  const timer = setInterval(tick, intervalMs);
  tick(); // 立即执行一次

  console.log('[Worker] 任务处理器已启动');

  // 返回停止函数
  return () => {
    running = false;
    clearInterval(timer);
    console.log('[Worker] 任务处理器已停止');
  };
};
```

---

## 六、前端 HTTP 服务模板

```typescript
// services/http.ts
const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_PREFIX = `${API_BASE}/api`;

// ============ 类型定义 ============

export interface ApiResult<T = any> {
  code: number;
  message: string;
  data: T | null;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// ============ Token 管理 ============

const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ============ 请求封装 ============

const withAuthHeaders = (init: RequestInit = {}): RequestInit => {
  const token = getToken();
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  };
};

const handleResponse = async <T>(resp: Response): Promise<ApiResult<T>> => {
  // 会话失效处理
  if (resp.status === 401) {
    clearToken();
    window.location.href = '/login';
    return { code: 401, message: '会话已失效', data: null };
  }

  // 权限不足
  if (resp.status === 403) {
    return { code: 403, message: '无权限访问', data: null };
  }

  try {
    return await resp.json();
  } catch {
    return {
      code: resp.status,
      message: resp.statusText || '请求失败',
      data: null,
    };
  }
};

// ============ HTTP 方法 ============

export const apiGet = async <T>(path: string): Promise<ApiResult<T>> => {
  const resp = await fetch(
    `${API_PREFIX}${path}`,
    withAuthHeaders({ method: 'GET' })
  );
  return handleResponse<T>(resp);
};

export const apiPost = async <T>(
  path: string,
  body?: unknown
): Promise<ApiResult<T>> => {
  const resp = await fetch(
    `${API_PREFIX}${path}`,
    withAuthHeaders({
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  );
  return handleResponse<T>(resp);
};

export const apiPut = async <T>(
  path: string,
  body?: unknown
): Promise<ApiResult<T>> => {
  const resp = await fetch(
    `${API_PREFIX}${path}`,
    withAuthHeaders({
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  );
  return handleResponse<T>(resp);
};

export const apiDelete = async <T>(path: string): Promise<ApiResult<T>> => {
  const resp = await fetch(
    `${API_PREFIX}${path}`,
    withAuthHeaders({ method: 'DELETE' })
  );
  return handleResponse<T>(resp);
};

// ============ 便捷方法 ============

/**
 * 检查响应是否成功
 */
export const isOk = <T>(result: ApiResult<T>): result is ApiResult<T> & { data: T } => {
  return result.code === 0 && result.data !== null;
};
```

---

## 七、会话存储模板（Redis）

```javascript
// lib/sessionStore.js
import { createClient } from 'redis';

const SESSION_PREFIX = 'session:';

export class SessionStore {
  constructor(redisUrl) {
    this.client = createClient({ url: redisUrl });
    this.client.on('error', (err) => console.error('[Redis]', err));
  }

  async connect() {
    await this.client.connect();
    console.log('[Redis] 已连接');
  }

  async disconnect() {
    await this.client.quit();
  }

  /**
   * 保存会话
   */
  async setSession(token, session, ttlSeconds = 7200) {
    const key = SESSION_PREFIX + token;
    await this.client.set(key, JSON.stringify(session), { EX: ttlSeconds });
  }

  /**
   * 获取会话
   */
  async getSession(token) {
    const key = SESSION_PREFIX + token;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 删除会话
   */
  async deleteSession(token) {
    const key = SESSION_PREFIX + token;
    await this.client.del(key);
  }

  /**
   * 刷新会话过期时间
   */
  async refreshSession(token, ttlSeconds = 7200) {
    const key = SESSION_PREFIX + token;
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * 批量删除用户所有会话
   */
  async deleteUserSessions(userId) {
    const pattern = `${SESSION_PREFIX}*`;
    const keys = await this.client.keys(pattern);

    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.user_id === userId) {
          await this.client.del(key);
        }
      }
    }
  }
}
```

---

## 八、链路追踪插件模板

```javascript
// plugins/trace.js
import crypto from 'crypto';

const genId = () => crypto.randomBytes(16).toString('hex');

/**
 * 注册链路追踪插件
 */
export const registerTrace = (server, { models } = {}) => {
  // 请求开始：生成/提取 trace_id 和 req_id
  server.ext('onRequest', (request, h) => {
    const traceId = request.headers['x-trace-id'] || genId();
    const reqId = request.headers['x-request-id'] || genId();

    request.app.traceId = traceId;
    request.app.reqId = reqId;
    request.app.startTime = Date.now();

    return h.continue;
  });

  // 响应时：回传 header 并记录日志
  server.ext('onPreResponse', async (request, h) => {
    const { traceId, reqId, startTime } = request.app;
    const durationMs = Date.now() - startTime;

    const resp = request.response;

    // 设置响应头
    if (resp.isBoom) {
      resp.output.headers['x-trace-id'] = traceId;
      resp.output.headers['x-request-id'] = reqId;
    } else {
      resp.header('X-Trace-Id', traceId);
      resp.header('X-Request-Id', reqId);
    }

    // 记录请求日志
    const statusCode = resp.isBoom
      ? resp.output.statusCode
      : resp.statusCode;

    console.log(
      JSON.stringify({
        time: new Date().toISOString(),
        trace_id: traceId,
        req_id: reqId,
        method: request.method.toUpperCase(),
        path: request.path,
        status: statusCode,
        duration_ms: durationMs,
        user_id: request.auth?.credentials?.userId,
      })
    );

    // 可选：持久化到数据库
    if (models?.RequestLog && process.env.REQUEST_LOG_ENABLED === '1') {
      await models.RequestLog.create({
        trace_id: traceId,
        req_id: reqId,
        method: request.method.toUpperCase(),
        path: request.path,
        status_code: statusCode,
        duration_ms: durationMs,
        user_id: request.auth?.credentials?.userId,
      }).catch(() => {}); // 静默失败
    }

    return h.continue;
  });
};
```
