import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ApiResponse } from '../utils/apiResponse'

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        path: e.path.slice(1).join('.'),
        message: e.message,
      }))
      ApiResponse.error(res, 'Validation failed', 400, errors)
      return
    }

    req.body = result.data.body ?? req.body
    next()
  }
