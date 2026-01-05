import { eq, like, and, isNull, sql } from "drizzle-orm";
import { db } from "../config";
import { users, roles, permissions, userRoles, rolePermissions } from "../models";
import { hashPassword } from "../utils";

export const userService = {
  // 获取用户列表
  async list(page: number, size: number, keyword?: string) {
    const conditions = [isNull(users.deletedAt)];

    if (keyword) {
      conditions.push(like(users.username, `%${keyword}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    const list = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(sql`${users.id} desc`)
      .limit(size)
      .offset((page - 1) * size);

    return { list, total: countResult.count };
  },

  // 创建用户
  async create(data: { username: string; password: string; displayName?: string; email?: string }) {
    // 检查用户名是否已存在
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existing && !existing.deletedAt) {
      return { success: false, error: "用户名已存在" };
    }

    const passwordHash = await hashPassword(data.password);

    const [result] = await db.insert(users).values({
      username: data.username,
      passwordHash,
      displayName: data.displayName || data.username,
      email: data.email,
    });

    return { success: true, data: { id: result.insertId } };
  },

  // 更新用户
  async update(id: number, data: { displayName?: string; email?: string; status?: number }) {
    await db.update(users).set(data).where(eq(users.id, id));
    return { success: true };
  },

  // 删除用户（软删除）
  async delete(id: number) {
    if (id === 1) {
      return { success: false, error: "不能删除超级管理员" };
    }

    await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
    return { success: true };
  },

  // 重置密码
  async resetPassword(id: number, newPassword: string) {
    const passwordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
    return { success: true };
  },
};

export const roleService = {
  // 获取角色列表
  async list() {
    return await db
      .select()
      .from(roles)
      .orderBy(sql`${roles.id} asc`);
  },

  // 创建角色
  async create(data: { code: string; name: string; description?: string }) {
    const [existing] = await db
      .select()
      .from(roles)
      .where(eq(roles.code, data.code))
      .limit(1);

    if (existing) {
      return { success: false, error: "角色编码已存在" };
    }

    const [result] = await db.insert(roles).values(data);
    return { success: true, data: { id: result.insertId } };
  },

  // 删除角色
  async delete(id: number) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await db.delete(userRoles).where(eq(userRoles.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
    return { success: true };
  },
};

export const permissionService = {
  // 获取权限列表
  async list() {
    return await db.select().from(permissions);
  },
};
