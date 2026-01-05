/**
 * API 服务入口
 *
 * 启动流程：
 * 1. 加载环境变量（缺失则提示并退出）
 * 2. 初始化日志
 * 3. 启动 HTTP 服务
 * 4. 标记服务已启动（日志切换到 DB）
 */

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

// 环境变量检查（必须最先导入）
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { db } from "./config/database";

import { tracePlugin } from "./plugins";
import { authRoutes, userRoutes, roleRoutes, permissionRoutes, statsRoutes } from "./routes";

const startLogger = logger.withContext("startup");

// 打印启动信息
startLogger.info("正在启动 API 服务...");
startLogger.info(`端口: ${env.PORT}`);
startLogger.info(`数据库: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);

const app = new Elysia()
  // 插件
  .use(cors({
    origin: ["http://localhost:7101", "http://localhost:7102"],
    credentials: true,
  }))
  .use(tracePlugin)

  // 健康检查
  .get("/health", () => ({ status: "ok", time: new Date().toISOString() }))

  // API 路由
  .group("/api", (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(roleRoutes)
      .use(permissionRoutes)
      .use(statsRoutes)
  )

  // 启动服务
  .listen(env.PORT);

// 服务已启动，切换日志到数据库
logger.markStarted(async () => db);

startLogger.info(`API 服务启动成功: http://localhost:${env.PORT}`);
console.log(`🚀 API server running at http://localhost:${env.PORT}`);

// 优雅退出
process.on("SIGINT", () => {
  startLogger.info("正在关闭服务...");
  logger.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  startLogger.info("正在关闭服务...");
  logger.destroy();
  process.exit(0);
});

export type App = typeof app;
