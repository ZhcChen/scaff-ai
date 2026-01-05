import { createClient, type RedisClientType } from "redis";
import { env } from "./env";
import { logger } from "../utils/logger";

const redisLogger = logger.withContext("redis");

let client: RedisClientType | null = null;

export const getRedis = async (): Promise<RedisClientType> => {
  if (!client) {
    client = createClient({
      url: env.REDIS_URL,
    });
    client.on("error", (err) => redisLogger.error("Redis 连接错误", { error: String(err) }));
    await client.connect();
    redisLogger.info("Redis 连接成功");
  }
  return client;
};

export const closeRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};
