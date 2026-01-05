# 文档结构与 AGENTS.md 模板

> 项目文档组织规范和 AI 协作规范模板。

---

## 一、文档目录结构

```
docs/
├── index.md                      # 文档索引
├── getting-started.md            # 快速开始
│
├── architecture/                 # 架构文档
│   ├── overview.md               # 架构概览
│   ├── tech-stack.md             # 技术选型
│   ├── data-model.md             # 数据模型
│   ├── api-design.md             # API 设计原则
│   └── security.md               # 安全设计
│
├── requirements/                 # 需求文档
│   ├── PRD-001-用户管理.md        # 产品需求文档
│   ├── PRD-002-xxx.md
│   └── ...
│
├── guides/                       # 开发指南
│   ├── development.md            # 开发环境搭建
│   ├── coding-standards.md       # 编码规范
│   ├── testing.md                # 测试指南
│   ├── deployment.md             # 部署指南
│   └── troubleshooting.md        # 常见问题
│
├── api/                          # API 文档
│   ├── overview.md               # API 概览
│   ├── auth.md                   # 认证接口
│   ├── users.md                  # 用户管理
│   └── ...
│
└── changelog/                    # 变更日志
    └── CHANGELOG.md
```

---

## 二、文档模板

### 2.1 文档索引模板 (index.md)

```markdown
# 项目文档

> [项目名称] 开发文档

## 快速导航

- [快速开始](./getting-started.md)
- [架构文档](./architecture/overview.md)
- [API 文档](./api/overview.md)
- [开发指南](./guides/development.md)

## 文档目录

### 架构
- [架构概览](./architecture/overview.md)
- [技术选型](./architecture/tech-stack.md)
- [数据模型](./architecture/data-model.md)

### 开发指南
- [开发环境搭建](./guides/development.md)
- [编码规范](./guides/coding-standards.md)
- [测试指南](./guides/testing.md)

### API 文档
- [认证接口](./api/auth.md)
- [用户管理](./api/users.md)

## 相关链接
- 代码仓库：[GitHub/GitLab 链接]
- 线上环境：[URL]
- 测试环境：[URL]
```

### 2.2 需求文档模板 (PRD)

```markdown
# PRD-001: 用户管理

| 属性 | 值 |
|------|-----|
| 文档版本 | 1.0 |
| 创建日期 | 2025-01-01 |
| 作者 | xxx |
| 状态 | 待评审 / 已确认 / 开发中 / 已完成 |

## 1. 背景与目标

### 1.1 背景
[描述业务背景和为什么需要这个功能]

### 1.2 目标
- 目标 1
- 目标 2

## 2. 功能需求

### 2.1 用户列表
**描述**：管理员可以查看系统中所有用户

**功能点**：
- [ ] 分页展示用户列表
- [ ] 支持按用户名/邮箱搜索
- [ ] 支持按状态筛选

### 2.2 创建用户
**描述**：管理员可以创建新用户

**字段**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 3-64字符 |
| password | string | 是 | 8-128字符 |
| email | string | 否 | 邮箱格式 |

## 3. 非功能需求

- 性能：列表接口响应时间 < 500ms
- 安全：密码加密存储

## 4. 设计稿

[Figma/设计稿链接]

## 5. 技术方案

[参考技术方案文档或简要说明]

## 6. 排期

| 阶段 | 工作内容 | 负责人 |
|------|----------|--------|
| 开发 | 后端 API | - |
| 开发 | 前端页面 | - |
| 测试 | 功能测试 | - |
```

### 2.3 API 文档模板

```markdown
# 用户管理 API

## 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/users | 获取用户列表 |
| POST | /api/users | 创建用户 |
| GET | /api/users/:id | 获取用户详情 |
| PUT | /api/users/:id | 更新用户 |
| DELETE | /api/users/:id | 删除用户 |

---

## GET /api/users

获取用户列表

### 请求参数

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| size | number | 否 | 每页数量，默认 20 |
| keyword | string | 否 | 搜索关键词 |
| status | number | 否 | 状态：0=禁用, 1=启用 |

### 响应

**成功响应**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "display_name": "管理员",
        "email": "admin@example.com",
        "status": 1,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

### 权限

- 需要登录
- 需要权限：`user:list`

---

## POST /api/users

创建用户

### 请求体

```json
{
  "username": "newuser",
  "password": "password123",
  "display_name": "新用户",
  "email": "user@example.com",
  "role_ids": [1, 2]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 3-64字符 |
| password | string | 是 | 8-128字符 |
| display_name | string | 否 | 显示名称 |
| email | string | 否 | 邮箱地址 |
| role_ids | number[] | 否 | 角色ID列表 |

### 响应

**成功响应**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 2,
    "username": "newuser"
  }
}
```

**错误响应**

| code | message |
|------|---------|
| 100001 | 参数验证失败 |
| 120003 | 用户名已存在 |
```

---

## 三、AGENTS.md 模板

```markdown
# AI Agent 协作规范

> 本文档定义 AI 辅助开发时应遵循的规范

## 1. 语言规范

- 所有文档、讨论与提交说明使用**简体中文**
- 代码注释使用中文或英文（同一文件保持一致）
- 变量/函数命名使用英文

## 2. 代码风格

### 2.1 通用规范
- 使用 ESLint + Prettier 格式化代码
- 缩进使用 2 空格
- 文件末尾保留一个空行
- 行尾不留空格

### 2.2 命名规范
- 变量/函数：camelCase
- 类/组件：PascalCase
- 常量：UPPER_SNAKE_CASE
- 文件：组件用 PascalCase，其他用 camelCase

### 2.3 注释规范
- 新增代码需要添加必要注释
- 复杂逻辑必须有说明
- 公共函数需要 JSDoc 注释

## 3. Git 提交规范

### 3.1 提交信息格式
```
<type>(<scope>): <subject>
```

### 3.2 Type 类型
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具

### 3.3 示例
```
feat(user): 添加用户头像上传功能
fix(auth): 修复 token 过期判断逻辑
docs(api): 更新用户接口文档
```

## 4. 开发流程

### 4.1 修改代码前
- 先理解现有实现逻辑
- 确认修改范围和影响

### 4.2 编写代码时
- 保持向后兼容，除非明确要求破坏性变更
- 遵循 DRY 原则，避免重复代码
- 新增功能需要添加测试

### 4.3 提交代码前
- 确保测试通过
- 确保代码已格式化
- 检查是否有遗漏的文件

## 5. API 约定

### 5.1 响应格式
所有接口返回统一格式：
```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

### 5.2 错误码
- 错误码集中管理在 `constants/errorCodes.js`
- 按业务域分配错误码段

### 5.3 输入验证
- 所有输入必须验证
- 使用 Joi/Zod 进行校验
- 防止 SQL 注入、XSS 攻击

## 6. 安全规范

### 6.1 认证授权
- 对外接口默认要求鉴权
- 敏感操作需要权限检查

### 6.2 敏感信息
- 禁止硬编码敏感信息
- 使用环境变量管理配置
- 不要在日志中输出密码、token

### 6.3 数据库
- 使用参数化查询
- 敏感字段加密存储

## 7. 组件使用优先级

1. 项目内已有的封装组件
2. UI 库标准组件（如 Ant Design）
3. 自定义实现

## 8. 文件组织

### 8.1 新功能开发
- 按现有模块划分放置
- 遵循目录结构规范
- 共享代码放 `shared/` 或 `lib/`

### 8.2 避免
- 循环依赖
- 过深的目录嵌套
- 单文件过大（建议 < 500 行）

## 9. 测试要求

### 9.1 单元测试
- 新增 Service 方法需要测试
- 工具函数需要测试
- 边界条件需要覆盖

### 9.2 测试命名
```javascript
test('函数名: 场景描述', () => {});
```

## 10. 文档要求

### 10.1 代码文档
- 公共 API 需要 JSDoc
- 复杂逻辑需要注释

### 10.2 变更文档
- 新功能需要更新 API 文档
- 重大变更需要更新架构文档
```

---

## 四、README.md 模板

```markdown
# 项目名称

> 简短的项目描述

## 功能特性

- 特性 1
- 特性 2
- 特性 3

## 技术栈

- 后端：Node.js + Hapi.js + MySQL + Redis
- 前端：React + TypeScript + Ant Design

## 快速开始

### 环境要求

- Node.js >= 20
- MySQL >= 8.0
- Redis >= 7.0

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd project-name

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入配置
```

### 启动开发服务

```bash
# 启动数据库（Docker）
docker-compose up -d

# 启动后端
npm run dev:api

# 启动前端
npm run dev:web
```

### 访问

- 前端：http://localhost:3000
- API：http://localhost:3090

## 项目结构

```
├── api/          # 后端服务
├── web-admin/    # 管理后台
├── docs/         # 文档
└── tests/        # 测试
```

## 开发文档

详见 [docs/index.md](./docs/index.md)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feat/xxx`)
3. 提交更改 (`git commit -m 'feat: add xxx'`)
4. 推送分支 (`git push origin feat/xxx`)
5. 创建 Pull Request

## 许可证

MIT
```
