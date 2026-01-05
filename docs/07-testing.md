# 测试策略与模板

> 测试分层策略和各层测试代码模板。

---

## 一、测试分层策略

### 1.1 测试金字塔

```
        /\
       /  \        E2E 测试（少量）
      /----\       - 用户完整流程
     /      \      - 跨系统集成
    /--------\     集成测试（适量）
   /          \    - API 端点测试
  /            \   - 数据库交互
 /--------------\  单元测试（大量）
/                \ - 纯函数
                   - Service 方法
                   - 工具函数
```

### 1.2 各层职责

| 层级 | 类型 | 覆盖范围 | 工具 | 数量占比 |
|------|------|----------|------|----------|
| L1 | 单元测试 | 纯函数、工具类、Service 方法 | node:test / Vitest | 70% |
| L2 | 集成测试 | API 端点、数据库交互、外部服务 | Supertest / Go | 20% |
| L3 | E2E 测试 | 完整用户流程 | Playwright | 10% |

### 1.3 测试原则

1. **快速反馈**：单元测试应在秒级完成
2. **隔离性**：测试之间不应互相影响
3. **可重复**：多次运行结果一致
4. **自描述**：测试名称应清晰描述预期行为
5. **边界覆盖**：覆盖正常流程和异常边界

---

## 二、单元测试模板

### 2.1 使用 Node.js 内置测试框架

```javascript
// tests/unit/feeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import { calcFeeAmount, FeeError } from '../../src/services/feeService.js';

// ============ 基础功能测试 ============

test('calcFeeAmount: 正常计算费用', () => {
  // amount=10000分, rate=25‱, fixed=10分
  // 预期: 10000 * 25 / 10000 + 10 = 35分
  assert.equal(calcFeeAmount(10_000, 25, 10), 35);
});

test('calcFeeAmount: 处理小数精度', () => {
  // 10001 * 25 / 10000 = 25.0025 → 四舍五入 = 25
  assert.equal(calcFeeAmount(10_001, 25, 0), 25);
});

// ============ 边界条件测试 ============

test('calcFeeAmount: 零金额返回固定费用', () => {
  assert.equal(calcFeeAmount(0, 25, 10), 10);
});

test('calcFeeAmount: 非法输入返回0', () => {
  assert.equal(calcFeeAmount('abc', 'x', 'y'), 0);
  assert.equal(calcFeeAmount(null, null, null), 0);
  assert.equal(calcFeeAmount(undefined, undefined, undefined), 0);
});

// ============ 异常测试 ============

test('FeeError: 费率倒挂应抛出错误', async () => {
  await assert.rejects(
    async () => {
      // 代理费率 < 成本费率
      throw new FeeError('FEE_INVERSION', '费率倒挂');
    },
    (err) => err instanceof FeeError && err.code === 'FEE_INVERSION'
  );
});
```

### 2.2 使用 Mock 测试 Service

```javascript
// tests/unit/userService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import { UserService } from '../../src/services/userService.js';

// Mock 数据库模型
const createMockModels = (overrides = {}) => ({
  User: {
    findOne: async () => null,
    findAndCountAll: async () => ({ count: 0, rows: [] }),
    create: async (data) => ({ id: 1, ...data }),
    ...overrides.User,
  },
  UserRole: {
    bulkCreate: async () => [],
    destroy: async () => 1,
    ...overrides.UserRole,
  },
});

// Mock sequelize
const mockSequelize = {
  transaction: async (fn) => fn({}),
};

// ============ 创建用户测试 ============

test('UserService.createUser: 成功创建用户', async () => {
  const models = createMockModels();
  const service = new UserService({ models, sequelize: mockSequelize });

  const result = await service.createUser({
    username: 'testuser',
    password: 'password123',
  });

  assert.equal(result.username, 'testuser');
  assert.ok(result.id);
});

test('UserService.createUser: 用户名重复应抛出错误', async () => {
  const models = createMockModels({
    User: {
      findOne: async () => ({ id: 1, username: 'exists' }),
    },
  });
  const service = new UserService({ models, sequelize: mockSequelize });

  await assert.rejects(
    () => service.createUser({ username: 'exists', password: '123' }),
    /用户名已存在/
  );
});

// ============ 查询用户测试 ============

test('UserService.getUserById: 用户不存在应抛出404', async () => {
  const models = createMockModels({
    User: {
      findOne: async () => null,
    },
  });
  const service = new UserService({ models, sequelize: mockSequelize });

  await assert.rejects(
    () => service.getUserById(999),
    (err) => err.output?.statusCode === 404
  );
});

test('UserService.listUsers: 正确返回分页数据', async () => {
  const mockUsers = [
    { id: 1, username: 'user1' },
    { id: 2, username: 'user2' },
  ];

  const models = createMockModels({
    User: {
      findAndCountAll: async () => ({
        count: 100,
        rows: mockUsers,
      }),
    },
  });
  const service = new UserService({ models, sequelize: mockSequelize });

  const result = await service.listUsers({ page: 1, size: 20 });

  assert.equal(result.total, 100);
  assert.equal(result.list.length, 2);
  assert.equal(result.page, 1);
  assert.equal(result.size, 20);
});
```

### 2.3 测试辅助函数

```javascript
// tests/unit/_helpers.js

/**
 * 创建 Mock Request 对象
 */
export const mockRequest = (overrides = {}) => ({
  params: {},
  query: {},
  payload: {},
  auth: {
    credentials: {
      userId: 1,
      permissions: [],
    },
  },
  ...overrides,
});

/**
 * 断言 Boom 错误
 */
export const assertBoomError = (err, statusCode, message) => {
  assert.ok(err.isBoom);
  assert.equal(err.output.statusCode, statusCode);
  if (message) {
    assert.ok(err.message.includes(message));
  }
};

/**
 * 延时函数
 */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
```

---

## 三、集成测试模板

### 3.1 使用 Supertest 测试 API

```javascript
// tests/integration/auth.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { createServer } from '../../src/server.js';

let server;
let app;

test.before(async () => {
  server = await createServer();
  await server.start();
  app = server.listener;
});

test.after(async () => {
  await server.stop();
});

// ============ 登录测试 ============

test('POST /api/auth/login - 成功登录', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'admin',
      password: 'admin123',
    })
    .expect(200);

  assert.equal(res.body.code, 0);
  assert.ok(res.body.data.token);
  assert.ok(res.body.data.expire_at);
});

test('POST /api/auth/login - 密码错误', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'admin',
      password: 'wrongpassword',
    })
    .expect(401);

  assert.notEqual(res.body.code, 0);
});

test('POST /api/auth/login - 参数验证失败', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'ab', // 太短
    })
    .expect(400);

  assert.notEqual(res.body.code, 0);
});

// ============ 认证保护测试 ============

test('GET /api/users - 无 Token 返回 401', async () => {
  await request(app)
    .get('/api/users')
    .expect(401);
});

test('GET /api/users - 有效 Token 返回数据', async () => {
  // 先登录获取 token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });

  const token = loginRes.body.data.token;

  const res = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(res.body.code, 0);
  assert.ok(Array.isArray(res.body.data.list));
});
```

### 3.2 数据库集成测试

```javascript
// tests/integration/db.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import { initDatabase } from '../../src/config/database.js';
import { initModels } from '../../src/models/index.js';

let sequelize;
let models;

test.before(async () => {
  sequelize = await initDatabase();
  models = initModels(sequelize);
  // 同步表结构（测试环境）
  await sequelize.sync({ force: true });
});

test.after(async () => {
  await sequelize.close();
});

test('User 模型: 创建和查询', async () => {
  const user = await models.User.create({
    username: 'testuser',
    password_hash: Buffer.from('hash'),
    display_name: 'Test User',
  });

  assert.ok(user.id);
  assert.equal(user.username, 'testuser');

  const found = await models.User.findByPk(user.id);
  assert.equal(found.username, 'testuser');
});

test('User 模型: 软删除', async () => {
  const user = await models.User.create({
    username: 'todelete',
    password_hash: Buffer.from('hash'),
  });

  await user.update({ deleted_at: new Date() });

  const found = await models.User.findOne({
    where: { username: 'todelete', deleted_at: null },
  });

  assert.equal(found, null);
});
```

---

## 四、E2E 测试模板

### 4.1 Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4.2 E2E 测试用例

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('用户认证流程', () => {
  test('成功登录并跳转到仪表盘', async ({ page }) => {
    await page.goto('/login');

    // 填写登录表单
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 验证跳转到仪表盘
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('仪表盘');
  });

  test('登录失败显示错误提示', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // 验证错误提示
    await expect(page.locator('.ant-message-error')).toBeVisible();
  });

  test('未登录访问受保护页面跳转到登录页', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL('/login');
  });

  test('登出后跳转到登录页', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 点击登出
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');

    await expect(page).toHaveURL('/login');
  });
});
```

### 4.3 页面对象模式

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.ant-message-error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// 使用示例
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('使用 Page Object 登录', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin', 'admin123');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 五、测试数据管理

### 5.1 测试 Fixtures

```javascript
// tests/fixtures/users.js
export const testUsers = {
  admin: {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
  },
  normalUser: {
    id: 2,
    username: 'user1',
    password: 'user123',
    role: 'user',
  },
};

export const createTestUser = async (models, overrides = {}) => {
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.hash('password123', 10);

  return models.User.create({
    username: `test_${Date.now()}`,
    password_hash: passwordHash,
    display_name: 'Test User',
    status: 1,
    ...overrides,
  });
};
```

### 5.2 数据库清理

```javascript
// tests/helpers/dbCleanup.js
export const cleanupTestData = async (sequelize) => {
  // 按依赖顺序删除
  const tables = [
    'user_roles',
    'users',
    'roles',
    // ...
  ];

  for (const table of tables) {
    await sequelize.query(`DELETE FROM ${table} WHERE id > 100`);
  }
};

export const resetAutoIncrement = async (sequelize, table, value = 101) => {
  await sequelize.query(`ALTER TABLE ${table} AUTO_INCREMENT = ${value}`);
};
```

---

## 六、测试覆盖率

### 6.1 Node.js 内置覆盖率

```bash
# 运行测试并生成覆盖率报告
node --test \
  --experimental-test-coverage \
  --test-coverage-exclude=tests/** \
  --test-coverage-lines=80 \
  --test-coverage-functions=80 \
  --test-coverage-branches=80 \
  tests/**/*.test.js
```

### 6.2 package.json 脚本

```json
{
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "test:coverage": "node --test --experimental-test-coverage --test-coverage-exclude=tests/** tests/**/*.test.js",
    "test:watch": "node --test --watch tests/**/*.test.js"
  }
}
```

---

## 七、CI 集成

### 7.1 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
```
