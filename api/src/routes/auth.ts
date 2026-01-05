import { Elysia, t } from "elysia";
import { authService } from "../services";
import { ok, error } from "../utils";
import { ERROR_CODES } from "../constants";
import { authPlugin } from "../plugins";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authPlugin)

  // 登录
  .post(
    "/login",
    async ({ body }) => {
      const result = await authService.login(body.username, body.password);

      if (!result.success) {
        return error(ERROR_CODES.AUTH_INVALID_CREDENTIALS, result.error!);
      }

      return ok(result.data);
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // 登出
  .post(
    "/logout",
    async ({ session }) => {
      if (session) {
        await authService.logout(session.token);
      }
      return ok(null, "已登出");
    },
    { requireAuth: true }
  )

  // 获取当前用户信息
  .get(
    "/profile",
    async ({ session }) => {
      const user = await authService.getProfile(session!.userId);
      return ok({
        ...user,
        roles: session!.roles,
        permissions: session!.permissions,
      });
    },
    { requireAuth: true }
  )

  // 修改密码
  .post(
    "/change-password",
    async ({ session, body }) => {
      const result = await authService.changePassword(
        session!.userId,
        body.oldPassword,
        body.newPassword
      );

      if (!result.success) {
        return error(ERROR_CODES.USER_PASSWORD_WRONG, result.error!);
      }

      return ok(null, "密码修改成功，请重新登录");
    },
    {
      requireAuth: true,
      body: t.Object({
        oldPassword: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 6 }),
      }),
    }
  );
