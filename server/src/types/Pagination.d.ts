export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}