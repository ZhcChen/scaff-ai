import { getRedis } from "../config";
import { genId } from "../utils";

const SESSION_PREFIX = "session:";
const DEFAULT_TTL = 7200; // 2 小时

export interface Session {
  token: string;
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  expireAt: string;
}

export const sessionStore = {
  // 创建会话
  async create(data: Omit<Session, "token" | "expireAt">, ttl = DEFAULT_TTL): Promise<Session> {
    const redis = await getRedis();
    const token = genId(64);
    const expireAt = new Date(Date.now() + ttl * 1000).toISOString();

    const session: Session = {
      ...data,
      token,
      expireAt,
    };

    await redis.set(SESSION_PREFIX + token, JSON.stringify(session), { EX: ttl });
    return session;
  },

  // 获取会话
  async get(token: string): Promise<Session | null> {
    const redis = await getRedis();
    const data = await redis.get(SESSION_PREFIX + token);
    return data ? JSON.parse(data) : null;
  },

  // 删除会话
  async delete(token: string): Promise<void> {
    const redis = await getRedis();
    await redis.del(SESSION_PREFIX + token);
  },

  // 刷新会话
  async refresh(token: string, ttl = DEFAULT_TTL): Promise<void> {
    const redis = await getRedis();
    await redis.expire(SESSION_PREFIX + token, ttl);
  },

  // 删除用户所有会话
  async deleteByUserId(userId: number): Promise<void> {
    const redis = await getRedis();
    const keys = await redis.keys(SESSION_PREFIX + "*");

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data) as Session;
        if (session.userId === userId) {
          await redis.del(key);
        }
      }
    }
  },
};
