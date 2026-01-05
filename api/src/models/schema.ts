import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  tinyint,
  int,
} from "drizzle-orm/mysql-core";

// ==================== 用户表 ====================
export const users = mysqlTable("auth_user", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  username: varchar("username", { length: 64 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 64 }).notNull().default(""),
  email: varchar("email", { length: 128 }),
  avatar: varchar("avatar", { length: 255 }),
  status: tinyint("status").notNull().default(1), // 1=启用, 0=禁用
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  deletedAt: timestamp("deleted_at"),
});

// ==================== 角色表 ====================
export const roles = mysqlTable("auth_role", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  description: varchar("description", { length: 255 }),
  status: tinyint("status").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ==================== 权限表 ====================
export const permissions = mysqlTable("auth_permission", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(), // 如 user:create
  name: varchar("name", { length: 64 }).notNull(),
  resource: varchar("resource", { length: 32 }).notNull(), // 资源类型
  action: varchar("action", { length: 32 }).notNull(), // 操作类型
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== 用户角色关联 ====================
export const userRoles = mysqlTable("auth_user_role", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== 角色权限关联 ====================
export const rolePermissions = mysqlTable("auth_role_permission", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
  permissionId: bigint("permission_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== 系统配置表 ====================
export const systemConfig = mysqlTable("sys_config", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ==================== 操作日志表 ====================
export const operationLogs = mysqlTable("sys_operation_log", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  username: varchar("username", { length: 64 }),
  action: varchar("action", { length: 64 }).notNull(),
  resource: varchar("resource", { length: 64 }),
  resourceId: varchar("resource_id", { length: 64 }),
  detail: text("detail"),
  ip: varchar("ip", { length: 64 }),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== 请求日志表 ====================
export const requestLogs = mysqlTable("sys_request_log", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  traceId: varchar("trace_id", { length: 64 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  statusCode: int("status_code").notNull(),
  durationMs: int("duration_ms").notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  ip: varchar("ip", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
