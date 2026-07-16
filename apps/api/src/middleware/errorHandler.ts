import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: Array<{ path: string; message: string }>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errors: err.errors,
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    })
    return
  }

  // Prisma errors
  if ('code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: `Duplicate value for: ${prismaErr.meta?.target?.join(', ') ?? 'field'}`,
      })
      return
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found' })
      return
    }
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` })
}
