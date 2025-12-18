export interface PaginationParams {
  page: number;
  pageSize: number;
//   [key: string]: any; 
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}