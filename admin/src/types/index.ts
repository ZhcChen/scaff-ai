// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// 分页数据
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// 用户
export interface User {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  status: number;
  createdAt: string;
}

// 角色
export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: number;
  createdAt: string;
}

// 权限
export interface Permission {
  id: number;
  code: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  expireAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  roles: string[];
  permissions: string[];
}

// 仪表盘统计
export interface DashboardStats {
  userCount: number;
  roleCount: number;
  todayRequests: number;
  requestTrend: { date: string; count: number }[];
}
