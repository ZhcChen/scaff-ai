# Scaff AI

项目脚手架模板 - 快速搭建全栈应用

## 项目结构

```
scaff-ai/
├── api/          # 后端 API (Bun + Elysia + Drizzle) - 端口 7100
├── admin/        # 管理后台 (React + Vite + Ant Design) - 端口 7101
├── web-app/      # 前端应用 (Nuxt.js) - 端口 7102
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

## 端口映射

| 服务 | 端口 |
|------|------|
| API | 7100 |
| Admin | 7101 |
| Web App | 7102 |

## 许可证

MIT
