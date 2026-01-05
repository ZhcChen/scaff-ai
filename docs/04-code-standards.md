# 代码规范与约定

> 统一的编码规范，确保代码风格一致、可维护。

---

## 一、命名规范

### 1.1 文件命名

```yaml
# 后端（Node.js / Go / Python）
模型文件: camelCase          # user.js, payOrder.js
服务文件: camelCase          # authService.js
路由文件: camelCase          # auth.js, user.js
常量文件: camelCase          # errorCodes.js
工具文件: camelCase          # response.js, helpers.js

# 前端（React/Vue）
组件文件: PascalCase.tsx     # UserAvatar.tsx, LoginForm.tsx
页面目录: PascalCase/        # Dashboard/, UserManagement/
Hook 文件: camelCase.ts      # useAuth.ts, useRequest.ts
服务文件: camelCase.ts       # http.ts, auth.ts
类型文件: camelCase.ts       # api.ts, user.types.ts
工具文件: camelCase.ts       # format.ts, validate.ts
```

### 1.2 代码命名

```typescript
// 变量和函数：camelCase
const userName = 'alice';
function getUserById(id: number) {}

// 类和组件：PascalCase
class AuthService {}
function UserAvatar() {}

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 5;
const API_BASE_URL = '/api';

// 接口和类型：PascalCase
interface UserProfile {}
type PaymentStatus = 'pending' | 'completed';

// 数据库字段：snake_case
// created_at, updated_at, user_id, order_no

// 枚举：PascalCase + UPPER_SNAKE_CASE
enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}
```

### 1.3 特殊命名约定

```typescript
// 布尔变量：is/has/can/should 前缀
const isLoading = true;
const hasPermission = false;
const canEdit = true;

// 事件处理：handle 前缀
const handleClick = () => {};
const handleSubmit = () => {};

// 异步函数：动词 + 名词
async function fetchUserList() {}
async function createOrder() {}

// 私有方法（类内）：_ 前缀（可选）
class Service {
  private _validateInput() {}
}
```

---

## 二、API 响应格式

### 2.1 统一响应结构

```typescript
// 响应结构定义
interface ApiResponse<T = any> {
  code: number;      // 0 = 成功，其他 = 错误码
  message: string;   // 描述信息
  data: T | null;    // 业务数据
}

// 成功响应示例
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 1,
    "username": "alice"
  }
}

// 错误响应示例
{
  "code": 100001,
  "message": "参数验证失败",
  "data": null
}
```

### 2.2 响应工具函数

```javascript
// utils/response.js
export const ok = (data = null, message = 'ok') => ({
  code: 0,
  message,
  data,
});

export const error = (code, message, data = null) => ({
  code,
  message,
  data,
});

// 使用示例
return ok({ user: userData }, '创建成功');
return error(100001, '用户名已存在');
```

### 2.3 分页响应格式

```typescript
interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// 示例
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

## 三、错误码规范

### 3.1 错误码分段

```javascript
// constants/errorCodes.js
export const ERROR_CODES = {
  // ========== 通用类（10xxxx）==========
  COMMON_ERROR: 100000,
  VALIDATION_FAILED: 100001,
  UNAUTHORIZED: 100002,
  FORBIDDEN: 100003,
  NOT_FOUND: 100004,
  RATE_LIMITED: 100005,

  // ========== 认证相关（11xxxx）==========
  AUTH_INVALID_CREDENTIALS: 110001,
  AUTH_TOKEN_EXPIRED: 110002,
  AUTH_SESSION_INVALID: 110003,
  AUTH_TOTP_REQUIRED: 110004,

  // ========== 用户相关（12xxxx）==========
  USER_NOT_FOUND: 120001,
  USER_DISABLED: 120002,
  USER_ALREADY_EXISTS: 120003,

  // ========== 业务 A（20xxxx）==========
  // ========== 业务 B（21xxxx）==========
  // ========== 业务 C（22xxxx）==========

  // ========== 外部服务（90xxxx）==========
  EXTERNAL_SERVICE_ERROR: 900001,
  EXTERNAL_TIMEOUT: 900002,
};
```

### 3.2 错误码使用规范

- **10xxxx**：通用错误（验证、权限、限流等）
- **11xxxx**：认证相关
- **12xxxx**：用户相关
- **20xxxx ~ 89xxxx**：业务模块（每个模块 1 万个码）
- **90xxxx**：外部服务错误

---

## 四、Git 提交规范

### 4.1 提交信息格式

```bash
<type>(<scope>): <subject>

# 可选 body
<body>

# 可选 footer
<footer>
```

### 4.2 Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat(auth): 添加 TOTP 双因素认证 |
| `fix` | 修复 bug | fix(order): 修复超时判断逻辑 |
| `docs` | 文档更新 | docs(api): 更新支付接口文档 |
| `style` | 代码格式 | style: 统一缩进为 2 空格 |
| `refactor` | 重构 | refactor(service): 拆分订单服务 |
| `perf` | 性能优化 | perf(query): 优化用户列表查询 |
| `test` | 测试相关 | test(auth): 添加登录单元测试 |
| `chore` | 构建/工具 | chore: 升级依赖版本 |
| `revert` | 回滚 | revert: 回滚上次提交 |

### 4.3 提交示例

```bash
# 功能开发
feat(user): 添加用户头像上传功能

- 支持 jpg/png 格式
- 最大 2MB
- 自动压缩和裁剪

# Bug 修复
fix(payment): 修复订单金额精度丢失问题

原因：JavaScript 浮点数精度问题
方案：使用 decimal.js 处理金额计算

Closes #123

# 文档更新
docs(readme): 更新开发环境配置说明
```

---

## 五、注释规范

### 5.1 函数注释

```javascript
/**
 * 计算订单费用
 * @param {number} amount - 订单金额（分）
 * @param {number} rate - 费率（万分比）
 * @param {number} fixed - 固定费用（分）
 * @returns {number} 总费用（分）
 */
function calcFee(amount, rate, fixed) {
  return Math.round(amount * rate / 10000) + fixed;
}
```

### 5.2 复杂逻辑注释

```javascript
// 使用乐观锁抢占任务
// 1. 先查询待处理任务
// 2. 尝试更新状态为 processing
// 3. 如果更新成功（affected === 1），则获得任务
// 4. 如果更新失败，说明被其他实例抢占
const [affected] = await Task.update(
  { status: 'processing' },
  { where: { id: task.id, status: 'pending' } }
);
if (affected !== 1) continue;
```

### 5.3 TODO 注释

```javascript
// TODO: 后续优化为批量查询
// FIXME: 临时方案，需要重构
// HACK: 绕过框架限制
// NOTE: 这里有特殊处理逻辑
```

---

## 六、代码风格配置

### 6.1 ESLint 配置

```javascript
// eslint.config.js (ESLint 9+)
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
```

### 6.2 Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true
}
```

### 6.3 EditorConfig

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## 七、安全规范

### 7.1 输入验证

```javascript
// 始终验证用户输入
const schema = Joi.object({
  username: Joi.string().min(3).max(64).required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(150).optional(),
});

const { error, value } = schema.validate(request.payload);
if (error) throw Boom.badRequest(error.message);
```

### 7.2 SQL 注入防护

```javascript
// 使用参数化查询（ORM 默认支持）
const user = await User.findOne({
  where: { username: inputUsername }  // 安全
});

// 避免字符串拼接
const user = await sequelize.query(
  `SELECT * FROM users WHERE username = '${input}'`  // 危险！
);
```

### 7.3 敏感信息处理

```javascript
// 不要在日志中输出敏感信息
console.log('User logged in:', { username });  // 正确
console.log('Login:', { username, password }); // 危险！

// 响应中排除敏感字段
const user = await User.findByPk(id, {
  attributes: { exclude: ['password_hash', 'totp_secret'] }
});
```

---

## 八、导入顺序规范

```typescript
// 1. Node.js 内置模块
import fs from 'fs';
import path from 'path';

// 2. 第三方模块
import express from 'express';
import { Sequelize } from 'sequelize';

// 3. 项目内部模块（绝对路径）
import { AuthService } from '@/services/authService';
import { ERROR_CODES } from '@/constants/errorCodes';

// 4. 相对路径模块
import { validateInput } from './utils';
import type { UserProfile } from './types';
```
