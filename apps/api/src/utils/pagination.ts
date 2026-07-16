export interface PaginationInput {
  page?: number | string
  limit?: number | string
}

export interface PaginationResult {
  skip: number
  take: number
  page: number
  limit: number
}

export function parsePagination(input: PaginationInput): PaginationResult {
  const page = Math.max(1, Number(input.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(input.limit) || 20))
  const skip = (page - 1) * limit
  return { skip, take: limit, page, limit }
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
