/**
 * 环境变量配置
 *
 * 启动前检查必要的环境变量，缺失时打印提示并退出
 */

import { logger } from "../utils/logger";

const envLogger = logger.withContext("env");

interface EnvConfig {
  // 服务配置
  PORT: number;

  // 数据库配置
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;

  // Redis 配置
  REDIS_URL: string;

  // 会话配置
  SESSION_SECRET: string;
  SESSION_TTL_SECONDS: number;
}

interface EnvVarDef {
  key: keyof EnvConfig;
  required: boolean;
  default?: string | number;
  description: string;
}

const ENV_VARS: EnvVarDef[] = [
  { key: "PORT", required: false, default: 7100, description: "服务端口" },
  { key: "DB_HOST", required: true, description: "数据库主机地址" },
  { key: "DB_PORT", required: false, default: 3306, description: "数据库端口" },
  { key: "DB_USER", required: true, description: "数据库用户名" },
  { key: "DB_PASS", required: true, description: "数据库密码" },
  { key: "DB_NAME", required: true, description: "数据库名称" },
  { key: "REDIS_URL", required: true, description: "Redis 连接地址" },
  { key: "SESSION_SECRET", required: true, description: "会话密钥" },
  { key: "SESSION_TTL_SECONDS", required: false, default: 7200, description: "会话过期时间(秒)" },
];

/**
 * 检查并加载环境变量
 */
export function loadEnv(): EnvConfig {
  // 检查 .env 文件是否存在
  const envPath = `${process.cwd()}/.env`;
  const envExists = Bun.file(envPath).size > 0;

  if (!envExists) {
    envLogger.warn("未找到 .env 文件，将使用环境变量或默认值");
    envLogger.info("提示: 复制 .env.example 为 .env 并配置相关参数");
    console.log("");
    console.log("  cp .env.example .env");
    console.log("");
  }

  const missing: string[] = [];
  const config: Partial<EnvConfig> = {};

  for (const def of ENV_VARS) {
    const value = process.env[def.key];

    if (!value && def.required) {
      missing.push(`  - ${def.key}: ${def.description}`);
    } else {
      // 类型转换
      const rawValue = value || def.default;
      if (def.key.includes("PORT") || def.key.includes("SECONDS")) {
        (config as any)[def.key] = Number(rawValue);
      } else {
        (config as any)[def.key] = rawValue;
      }
    }
  }

  if (missing.length > 0) {
    console.log("");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    ⚠️  环境变量缺失                         ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║  以下必需的环境变量未配置:                                 ║");
    console.log("╟────────────────────────────────────────────────────────────╢");

    for (const m of missing) {
      console.log(`║  ${m.padEnd(58)}║`);
    }

    console.log("╟────────────────────────────────────────────────────────────╢");
    console.log("║  请按以下步骤配置:                                         ║");
    console.log("║  1. cp .env.example .env                                   ║");
    console.log("║  2. 编辑 .env 文件，填写相关配置                           ║");
    console.log("║  3. 重新启动服务                                           ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");

    process.exit(1);
  }

  return config as EnvConfig;
}

// 加载并导出配置
export const env = loadEnv();
