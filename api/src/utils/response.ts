import { ERROR_CODES, type ErrorCode } from "../constants";

// 统一响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// 成功响应
export const ok = <T>(data: T, message = "ok"): ApiResponse<T> => ({
  code: ERROR_CODES.SUCCESS,
  message,
  data,
});

// 错误响应
export const error = (
  code: ErrorCode,
  message: string,
  data: unknown = null
): ApiResponse<unknown> => ({
  code,
  message,
  data,
});

// 分页响应数据
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// 分页成功响应
export const okPage = <T>(
  list: T[],
  total: number,
  page: number,
  size: number
): ApiResponse<PaginatedData<T>> => ({
  code: ERROR_CODES.SUCCESS,
  message: "ok",
  data: { list, total, page, size },
});
