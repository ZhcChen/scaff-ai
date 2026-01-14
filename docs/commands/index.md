# 常用命令

## 根目录

```bash
bun install          # 安装依赖
bun run dev          # 启动所有服务
bun run build        # 构建所有服务
```

## API 服务

```bash
cd api
bun run dev          # 启动开发服务器 (端口 7100)
bun run db:generate  # 生成数据库迁移
bun run db:push      # 应用数据库迁移
bun run db:studio    # 启动 Drizzle Studio
```

## 管理后台

```bash
cd admin
bun run dev          # 启动开发服务器 (端口 7101)
bun run build        # 生产构建
```

## 前端应用

```bash
cd web-app
bun run dev          # 启动开发服务器 (端口 7102)
bun run build        # 生产构建
```

## 测试

```bash
cd tests/go
go test ./... -v     # 运行所有测试
go test ./auth -v    # 运行认证测试
go test ./rbac -v    # 运行 RBAC 测试
```

## 服务端口

| 服务 | 端口 |
|------|------|
| API | 7100 |
| Admin | 7101 |
| Web App | 7102 |
