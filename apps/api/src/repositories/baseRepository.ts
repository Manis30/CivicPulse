export type FilterQuery<T = any> = Record<string, any>;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sanitizePagination(params?: PaginationParams): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(params?.page) || 1);
  const rawLimit = Math.max(1, Number(params?.limit) || 20);
  const limit = Math.min(100, rawLimit); // Cap limit at 100
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
