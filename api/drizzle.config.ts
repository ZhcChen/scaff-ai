import type { Config } from "drizzle-kit";

export default {
  schema: "./src/models/schema.ts",
  out: "./sql/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 23306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "scaff_ai",
  },
} satisfies Config;
