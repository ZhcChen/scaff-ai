import { eq } from "drizzle-orm";
import { db } from "../config";
import { users, userRoles, rolePermissions, roles, permissions } from "../models";
import { hashPassword, verifyPassword } from "../utils";
import { sessionStore } from "../lib";

export const authService = {
  // 登录
  async login(username: string, password: string) {
    // 查找用户
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user || user.deletedAt) {
      return { success: false, error: "用户不存在" };
    }

    if (user.status !== 1) {
      return { success: false, error: "用户已被禁用" };
    }

    // 验证密码
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "密码错误" };
    }

    // 获取用户角色和权限
    const userRoleList = await db
      .select({ roleId: userRoles.roleId, code: roles.code })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    const roleIds = userRoleList.map((r) => r.roleId);
    const roleCodes = userRoleList.map((r) => r.code);

    let permissionCodes: string[] = [];
    if (roleIds.length > 0) {
      const perms = await db
        .selectDistinct({ code: permissions.code })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleIds[0])); // TODO: 支持多角色

      permissionCodes = perms.map((p) => p.code);
    }

    // 创建会话
    const session = await sessionStore.create({
      userId: user.id,
      username: user.username,
      roles: roleCodes,
      permissions: permissionCodes,
    });

    return {
      success: true,
      data: {
        token: session.token,
        expireAt: session.expireAt,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        roles: roleCodes,
        permissions: permissionCodes,
      },
    };
  },

  // 登出
  async logout(token: string) {
    await sessionStore.delete(token);
  },

  // 获取当前用户信息
  async getProfile(userId: number) {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  },

  // 修改密码
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    const valid = await verifyPassword(oldPassword, user.passwordHash);
    if (!valid) {
      return { success: false, error: "原密码错误" };
    }

    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));

    // 清除所有会话
    await sessionStore.deleteByUserId(userId);

    return { success: true };
  },
};
