# Scaff AI

项目脚手架模板 - 快速搭建全栈应用

## 项目结构

```
scaff-ai/
├── api/          # 后端 API (Bun + Elysia + Drizzle) - 端口 7100
├── admin/        # 管理后台 (React + Vite + Ant Design) - 端口 7101
├── web-app/      # 前端应用 (Nuxt.js) - 端口 7102
├── tests/        # 测试模块
│   └── go/       # Go 集成测试
└── docs/         # 文档
```

## 快速开始

### 安装依赖

```bash
bun install
```

### 启动开发服务

```bash
# 同时启动所有服务
bun run dev

# 或分别启动
bun run dev:api      # API 服务 http://localhost:7100
bun run dev:admin    # 管理后台 http://localhost:7101
bun run dev:web-app  # 前端应用 http://localhost:7102
```

### 数据库配置

1. 创建 MySQL 数据库
2. 复制配置文件：`cp api/.env.example api/.env`
3. 修改数据库连接信息
4. 运行数据库迁移：`cd api && bun run db:push`
5. 执行初始化脚本：`mysql -u root -p scaff_ai < api/sql/seeds/init.sql`

### 默认账号

- 用户名：admin
- 密码：admin123

## 技术栈

- **后端**：Bun + Elysia + Drizzle ORM + MySQL + Redis
- **管理后台**：React + Vite + Ant Design + Zustand
- **前端应用**：Nuxt.js 3 + Vue 3
- **集成测试**：Go + resty + testify

## 端口映射

| 服务 | 端口 |
|------|------|
| API | 7100 |
| Admin | 7101 |
| Web App | 7102 |

## 测试

### 运行集成测试

```bash
# 确保 API 服务已启动
cd tests/go
go mod tidy
go test ./... -v
```

### 运行指定测试

```bash
# 认证模块测试
go test ./auth -v

# 指定用例
go test ./auth -run TestAuthFlow_LoginAndProfile -v

# 带数据库直连
go test ./auth -v -args \
  -api_base=http://127.0.0.1:7100 \
  -db_dsn='root:password@tcp(127.0.0.1:3306)/scaff_ai'
```

## 文档

详细文档请查看 [docs/](./docs/) 目录：

- [01-quick-start.md](./docs/01-quick-start.md) - 快速开始
- [02-tech-stack.md](./docs/02-tech-stack.md) - 技术栈说明
- [03-directory-structure.md](./docs/03-directory-structure.md) - 目录结构
- [07-testing.md](./docs/07-testing.md) - 测试策略

## 许可证

MIT
