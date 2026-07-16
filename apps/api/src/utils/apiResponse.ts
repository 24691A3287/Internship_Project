import { Response } from 'express'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  errors?: Array<{ path: string; message: string }>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const ApiResponse = {
  success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    })
  },

  created<T>(res: Response, data: T, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      data,
      message,
    })
  },

  paginated<T>(res: Response, data: T[], meta: PaginationMeta, message?: string) {
    return res.status(200).json({
      success: true,
      data,
      pagination: meta,
      message,
    })
  },

  error(res: Response, error: string, statusCode = 400, errors?: Array<{ path: string; message: string }>) {
    return res.status(statusCode).json({
      success: false,
      error,
      errors,
    })
  },

  unauthorized(res: Response, message = 'Unauthorized') {
    return res.status(401).json({ success: false, error: message })
  },

  forbidden(res: Response, message = 'Forbidden') {
    return res.status(403).json({ success: false, error: message })
  },

  notFound(res: Response, message = 'Not found') {
    return res.status(404).json({ success: false, error: message })
  },

  serverError(res: Response, message = 'Internal server error') {
    return res.status(500).json({ success: false, error: message })
  },
}
