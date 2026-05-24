export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface JwtPayload {
  userId?: number;
  adminId?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
