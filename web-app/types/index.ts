export interface User {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
  roles: string[];
  permissions: string[];
}
