import { Elysia } from "elysia";
import { sessionStore, type Session } from "../lib";
import { error } from "../utils";
import { ERROR_CODES } from "../constants";

export type AuthSession = Session | null;

export const authPlugin = new Elysia({ name: "auth" })
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return { session: null };
    }

    const token = authHeader.slice(7);
    const session = await sessionStore.get(token);

    return { session };
  })
  .macro({
    // 装饰器：需要认证
    requireAuth: (enabled: boolean) => ({
      beforeHandle: ({ session }) => {
        if (!enabled) return;

        if (!session) {
          return error(ERROR_CODES.UNAUTHORIZED, "请先登录");
        }

        if (new Date(session.expireAt) < new Date()) {
          return error(ERROR_CODES.AUTH_TOKEN_EXPIRED, "会话已过期");
        }
      },
    }),

    // 装饰器：需要权限
    requirePermission: (permission: string) => ({
      beforeHandle: ({ session }) => {
        if (!session) {
          return error(ERROR_CODES.UNAUTHORIZED, "请先登录");
        }

        // 超级管理员（userId=1）放行
        if (session.userId === 1) return;

        if (!session.permissions.includes(permission)) {
          return error(ERROR_CODES.PERMISSION_DENIED, "无操作权限");
        }
      },
    }),
  });
