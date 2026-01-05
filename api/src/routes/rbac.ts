import { Elysia, t } from "elysia";
import { userService, roleService, permissionService } from "../services";
import { ok, okPage, error } from "../utils";
import { ERROR_CODES } from "../constants";
import { authPlugin } from "../plugins";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)

  // 获取用户列表
  .get(
    "/",
    async ({ query }) => {
      const { page = 1, size = 20, keyword } = query;
      const result = await userService.list(page, size, keyword);
      return okPage(result.list, result.total, page, size);
    },
    {
      requireAuth: true,
      requirePermission: "user:list",
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        size: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        keyword: t.Optional(t.String()),
      }),
    }
  )

  // 创建用户
  .post(
    "/",
    async ({ body }) => {
      const result = await userService.create(body);

      if (!result.success) {
        return error(ERROR_CODES.USER_ALREADY_EXISTS, result.error!);
      }

      return ok(result.data, "创建成功");
    },
    {
      requireAuth: true,
      requirePermission: "user:create",
      body: t.Object({
        username: t.String({ minLength: 3, maxLength: 64 }),
        password: t.String({ minLength: 6, maxLength: 128 }),
        displayName: t.Optional(t.String({ maxLength: 64 })),
        email: t.Optional(t.String()),
      }),
    }
  )

  // 更新用户
  .put(
    "/:id",
    async ({ params, body }) => {
      await userService.update(params.id, body);
      return ok(null, "更新成功");
    },
    {
      requireAuth: true,
      requirePermission: "user:update",
      params: t.Object({ id: t.Number() }),
      body: t.Object({
        displayName: t.Optional(t.String({ maxLength: 64 })),
        email: t.Optional(t.String()),
        status: t.Optional(t.Number()),
      }),
    }
  )

  // 删除用户
  .delete(
    "/:id",
    async ({ params }) => {
      const result = await userService.delete(params.id);

      if (!result.success) {
        return error(ERROR_CODES.FORBIDDEN, result.error!);
      }

      return ok(null, "删除成功");
    },
    {
      requireAuth: true,
      requirePermission: "user:delete",
      params: t.Object({ id: t.Number() }),
    }
  )

  // 重置密码
  .post(
    "/:id/reset-password",
    async ({ params, body }) => {
      await userService.resetPassword(params.id, body.password);
      return ok(null, "密码重置成功");
    },
    {
      requireAuth: true,
      requirePermission: "user:update",
      params: t.Object({ id: t.Number() }),
      body: t.Object({ password: t.String({ minLength: 6 }) }),
    }
  );

export const roleRoutes = new Elysia({ prefix: "/roles" })
  .use(authPlugin)

  // 获取角色列表
  .get(
    "/",
    async () => {
      const list = await roleService.list();
      return ok(list);
    },
    { requireAuth: true, requirePermission: "role:list" }
  )

  // 创建角色
  .post(
    "/",
    async ({ body }) => {
      const result = await roleService.create(body);

      if (!result.success) {
        return error(ERROR_CODES.ROLE_ALREADY_EXISTS, result.error!);
      }

      return ok(result.data, "创建成功");
    },
    {
      requireAuth: true,
      requirePermission: "role:create",
      body: t.Object({
        code: t.String({ minLength: 1, maxLength: 64 }),
        name: t.String({ minLength: 1, maxLength: 64 }),
        description: t.Optional(t.String({ maxLength: 255 })),
      }),
    }
  )

  // 删除角色
  .delete(
    "/:id",
    async ({ params }) => {
      await roleService.delete(params.id);
      return ok(null, "删除成功");
    },
    {
      requireAuth: true,
      requirePermission: "role:delete",
      params: t.Object({ id: t.Number() }),
    }
  );

export const permissionRoutes = new Elysia({ prefix: "/permissions" })
  .use(authPlugin)

  // 获取权限列表
  .get(
    "/",
    async () => {
      const list = await permissionService.list();
      return ok(list);
    },
    { requireAuth: true, requirePermission: "permission:list" }
  );
