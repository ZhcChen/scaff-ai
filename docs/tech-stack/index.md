# 技术栈配置

> 默认使用 Bun + Elysia + Drizzle 技术栈

---

## 技术栈总览

```yaml
# 后端
runtime: Bun >= 1.0
framework: Elysia
orm: Drizzle
database: MySQL / PostgreSQL
cache: Redis
validation: TypeBox (Elysia 内置)

# 前端
framework: React 18+
build_tool: Vite
language: TypeScript 5+
ui_library: Ant Design
state_management: Zustand
router: react-router-dom

# 测试
unit_test: bun:test
e2e_test: Playwright

# 工具链
package_manager: bun
lint: Biome
git_hooks: lefthook
```

---

## 技术选型说明

| 类别 | 推荐 | 备选 | 说明 |
|------|------|------|------|
| **运行时** | **Bun** | Node.js | 更快，内置 TypeScript/测试/打包 |
| **后端框架** | **Elysia** | Hono | 端到端类型安全，性能极好 |
| **ORM** | **Drizzle** | Prisma, Kysely | 性能最好，类型安全，SQL-like |
| **验证** | **TypeBox** | Valibot | Elysia 内置，性能最好 |
| 前端框架 | React | Vue 3 | 生态丰富，TypeScript 支持好 |
| UI 库 | Ant Design | shadcn/ui | 企业级组件库，开箱即用 |
| 状态管理 | Zustand | Jotai | 轻量简洁 |

---

## 为什么选择 Bun？

1. **更快的启动速度**：比 Node.js 快 4x
2. **内置 TypeScript**：无需额外配置
3. **内置测试框架**：`bun:test` 开箱即用
4. **内置打包器**：`bun build` 替代 webpack/esbuild
5. **兼容 Node.js**：大部分 npm 包可直接使用
6. **统一工具链**：一个工具解决运行/测试/打包

---

## ORM 对比

| ORM | 性能 | 类型安全 | 特点 |
|-----|------|----------|------|
| **Drizzle** | ⭐⭐⭐ 最快 | ⭐⭐⭐ 完美 | SQL-like 语法，轻量，原生 Bun 支持 |
| Prisma | ⭐⭐ 中等 | ⭐⭐⭐ 完美 | Schema-first，迁移工具完善 |
| Kysely | ⭐⭐⭐ 快 | ⭐⭐⭐ 完美 | 纯 Query Builder，更底层 |

**默认使用 Drizzle：**
- 性能最好，无额外引擎层
- 类型推断完美
- SQL-like 语法，学习成本低
- `drizzle-kit` 提供迁移能力

---

## 验证库对比

| 库 | 性能 | Bundle Size | 特点 |
|-----|------|-------------|------|
| **TypeBox** | ⭐⭐⭐ 最快 | 中等 | Elysia 内置，JSON Schema 兼容 |
| Valibot | ⭐⭐ 快 | ⭐⭐⭐ 最小 | 模块化设计，tree-shaking 友好 |
| Zod | ⭐ 较慢 | 较大 | 生态最好，API 最流行 |

**默认使用 TypeBox**：Elysia 内置，无需额外依赖。

---

## 版本配置

### package.json

```json
{
  "name": "project-name",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "test": "bun test"
  }
}
```

---

## 开发环境

### Docker Compose

```yaml
services:
  mysql:
    image: mysql:8.0
    ports:
      - "23306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: dev_db
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "26379:6379"
    command: redis-server --requirepass 123456

volumes:
  mysql_data:
```

### VSCode 扩展

```json
{
  "recommendations": [
    "biomejs.biome",
    "oven.bun-vscode"
  ]
}
```

---

## 迁移说明

如需迁移到 Node.js：
- 运行时：`bun` → `node`
- 测试：`bun:test` → `vitest`
- 包管理：`bun` → `pnpm`
