import { http, setToken, clearToken } from "./http";
import type { LoginResponse, User, DashboardStats, PaginatedData, Role, Permission } from "@/types";

// 认证相关
export const authApi = {
  login: (username: string, password: string) =>
    http.post<LoginResponse>("/auth/login", { username, password }),

  logout: () => http.post("/auth/logout"),

  getProfile: () => http.get<User & { roles: string[]; permissions: string[] }>("/auth/profile"),

  changePassword: (oldPassword: string, newPassword: string) =>
    http.post("/auth/change-password", { oldPassword, newPassword }),
};

// 用户管理
export const userApi = {
  list: (page = 1, size = 20, keyword?: string) =>
    http.get<PaginatedData<User>>(`/users?page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ""}`),

  create: (data: { username: string; password: string; displayName?: string; email?: string }) =>
    http.post<{ id: number }>("/users", data),

  update: (id: number, data: { displayName?: string; email?: string; status?: number }) =>
    http.put(`/users/${id}`, data),

  delete: (id: number) => http.delete(`/users/${id}`),

  resetPassword: (id: number, password: string) =>
    http.post(`/users/${id}/reset-password`, { password }),
};

// 角色管理
export const roleApi = {
  list: () => http.get<Role[]>("/roles"),

  create: (data: { code: string; name: string; description?: string }) =>
    http.post<{ id: number }>("/roles", data),

  delete: (id: number) => http.delete(`/roles/${id}`),
};

// 权限管理
export const permissionApi = {
  list: () => http.get<Permission[]>("/permissions"),
};

// 统计
export const statsApi = {
  getDashboard: () => http.get<DashboardStats>("/stats/dashboard"),
};

export { setToken, clearToken, getToken } from "./http";
