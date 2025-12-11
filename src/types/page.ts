export interface PaginationParams {
  page: number;
  pageSize: number;
//   [key: string]: any; // 其他筛选参数
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}