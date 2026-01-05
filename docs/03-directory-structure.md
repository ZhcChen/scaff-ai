# 目录结构规范

> 标准化的目录结构，确保项目组织清晰一致。

---

## 一、Monorepo 全栈项目

适用于：前后端分离的全栈应用、多端应用（管理后台 + 用户端 + 商户端）

```
project-root/
├── api/                          # 后端 API 服务
│   ├── src/
│   │   ├── config/               # 配置（数据库、缓存、环境）
│   │   ├── constants/            # 常量定义（错误码、枚举）
│   │   ├── lib/                  # 底层库（迁移、工具类）
│   │   ├── models/               # 数据模型层
│   │   ├── plugins/              # 框架插件（认证、日志、响应）
│   │   ├── routes/               # 路由定义层
│   │   ├── services/             # 业务服务层
│   │   ├── utils/                # 工具函数
│   │   ├── workers/              # 后台任务
│   │   └── server.js             # 入口文件
│   ├── sql/                      # 数据库迁移脚本
│   │   ├── schema_phase*.sql     # 基础结构（按阶段）
│   │   └── migrations/           # 增量迁移
│   ├── tests/                    # 单元测试
│   │   └── unit/
│   └── package.json
│
├── web-admin/                    # 管理后台前端
│   ├── src/
│   │   ├── assets/               # 静态资源
│   │   ├── components/           # 通用组件
│   │   ├── hooks/                # 自定义 Hooks
│   │   ├── pages/                # 页面组件
│   │   ├── services/             # API 服务封装
│   │   ├── stores/               # 状态管理
│   │   ├── types/                # TypeScript 类型
│   │   ├── utils/                # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── web-[other]/                  # 其他前端应用（结构同上）
│
├── web-shared/                   # 前端共享代码
│   └── src/
│       ├── components/           # 共享组件
│       ├── hooks/                # 共享 Hooks
│       ├── types/                # 共享类型
│       └── utils/                # 共享工具
│
├── tests/                        # 集成/E2E 测试
│   ├── e2e/                      # Playwright E2E
│   └── integration/              # 集成测试
│
├── docker/                       # Docker 配置
│   ├── docker-compose.yml
│   └── [service]/
│
├── docs/                         # 项目文档
│   ├── index.md                  # 文档索引
│   ├── architecture/             # 架构文档
│   ├── requirements/             # 需求文档
│   ├── api/                      # API 文档
│   └── guides/                   # 开发指南
│
├── .env.example                  # 环境变量示例
├── package.json                  # Monorepo 根配置
├── AGENTS.md                     # AI 协作规范
└── README.md
```

---

## 二、单体后端项目

适用于：纯 API 服务、微服务单体

```
project-root/
├── src/
│   ├── config/                   # 配置
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── index.js
│   ├── constants/                # 常量
│   │   ├── errorCodes.js
│   │   └── enums.js
│   ├── lib/                      # 底层库
│   │   ├── dbMigrate.js
│   │   ├── logger.js
│   │   └── idGenerator.js
│   ├── models/                   # 数据模型
│   │   ├── index.js              # 模型初始化
│   │   ├── user.js
│   │   └── ...
│   ├── middleware/               # 中间件（Express/Fastify）
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/                   # 路由
│   │   ├── index.js              # 路由注册入口
│   │   ├── auth.js
│   │   └── ...
│   ├── services/                 # 业务服务
│   │   ├── authService.js
│   │   └── ...
│   ├── utils/                    # 工具函数
│   │   ├── response.js
│   │   └── helpers.js
│   ├── workers/                  # 后台任务
│   │   └── ...
│   └── app.js                    # 入口文件
├── sql/                          # 数据库脚本
├── tests/                        # 测试
│   ├── unit/
│   └── integration/
├── docs/                         # 文档
├── .env.example
└── package.json
```

---

## 三、前端 SPA 项目

适用于：独立的前端应用

```
project-root/
├── src/
│   ├── assets/                   # 静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   ├── components/               # 组件
│   │   ├── common/               # 通用组件（Button, Modal...）
│   │   ├── layout/               # 布局组件（Header, Sidebar...）
│   │   └── business/             # 业务组件
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   └── useRequest.ts
│   ├── pages/                    # 页面组件
│   │   ├── Login/
│   │   │   ├── index.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── Dashboard/
│   │   └── ...
│   ├── services/                 # API 服务
│   │   ├── http.ts               # HTTP 封装
│   │   ├── auth.ts
│   │   └── user.ts
│   ├── stores/                   # 状态管理
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   ├── types/                    # TypeScript 类型
│   │   ├── api.ts
│   │   └── models.ts
│   ├── utils/                    # 工具函数
│   │   ├── format.ts
│   │   └── validate.ts
│   ├── router/                   # 路由配置
│   │   └── index.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/                       # 公共资源
├── tests/                        # 测试
│   ├── unit/
│   └── e2e/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 四、目录职责说明

### 后端目录职责

| 目录 | 职责 | 依赖关系 |
|------|------|----------|
| `config/` | 环境配置、连接配置 | 被所有层依赖 |
| `constants/` | 常量定义、枚举 | 被所有层依赖 |
| `lib/` | 底层工具库 | 被 services/routes 依赖 |
| `models/` | 数据模型定义 | 被 services 依赖 |
| `plugins/` | 框架插件扩展 | 被 server 依赖 |
| `routes/` | 路由 + 请求验证 | 依赖 services |
| `services/` | 业务逻辑 | 依赖 models |
| `utils/` | 通用工具函数 | 被所有层使用 |
| `workers/` | 后台任务 | 依赖 models/services |

### 前端目录职责

| 目录 | 职责 | 说明 |
|------|------|------|
| `components/` | 可复用 UI 组件 | 无业务逻辑 |
| `pages/` | 页面组件 | 组合 components |
| `services/` | API 调用封装 | 统一 HTTP 请求 |
| `stores/` | 全局状态管理 | 跨组件共享状态 |
| `hooks/` | 自定义 Hooks | 逻辑复用 |
| `utils/` | 工具函数 | 纯函数 |

---

## 五、文件命名规范

```yaml
# 后端（Node.js）
模型文件: camelCase.js          # user.js, payOrder.js
服务文件: camelCase.js          # authService.js
路由文件: camelCase.js          # auth.js, user.js
工具文件: camelCase.js          # response.js

# 前端（React/Vue）
组件文件: PascalCase.tsx        # UserAvatar.tsx
页面目录: PascalCase/           # Dashboard/index.tsx
Hook文件: camelCase.ts          # useAuth.ts
服务文件: camelCase.ts          # http.ts, auth.ts
类型文件: camelCase.ts          # api.ts, models.ts
工具文件: camelCase.ts          # format.ts
```

---

## 六、索引文件规范

### 模型层 index.js

```javascript
// models/index.js
import { Sequelize } from 'sequelize';
import defineUser from './user.js';
import defineRole from './role.js';

export const initModels = (sequelize) => {
  const models = {
    User: defineUser(sequelize),
    Role: defineRole(sequelize),
  };

  // 定义关联关系
  models.User.belongsToMany(models.Role, { through: 'user_roles' });
  models.Role.belongsToMany(models.User, { through: 'user_roles' });

  return models;
};
```

### 路由层 index.js

```javascript
// routes/index.js
import { registerAuthRoutes } from './auth.js';
import { registerUserRoutes } from './user.js';

export const registerRoutes = (server, deps) => {
  server.realm.modifiers.route.prefix = '/api';

  registerAuthRoutes(server, deps);
  registerUserRoutes(server, deps);
};
```
