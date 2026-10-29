/**
 * Pagination utility for list endpoints.
 * 
 * Provides consistent pagination across all list/search APIs.
 * The frontend sends ?page=1&limit=20 and gets back metadata
 * about total items, total pages, and whether more pages exist.
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Parse and validate pagination query parameters.
 * 
 * @param page - Page number (1-based, from query string)
 * @param limit - Items per page (from query string)
 * @param maxLimit - Maximum allowed items per page
 */
export function parsePagination(
  page?: string | number,
  limit?: string | number,
  maxLimit = 50,
): PaginationParams {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, Number(limit) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
}

/**
 * Create pagination metadata from query results.
 * 
 * @param total - Total number of items matching the query
 * @param params - The pagination params used for the query
 */
export function createPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);

  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasMore: params.page < totalPages,
  };
}
