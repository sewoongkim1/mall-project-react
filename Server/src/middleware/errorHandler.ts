import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod 유효성 에러
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: '입력값이 올바르지 않습니다',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  // 일반 에러
  if (err instanceof Error) {
    const status = (err as any).status ?? 500
    console.error(`[${status}] ${err.message}`)
    return res.status(status).json({
      success: false,
      error: status === 500 ? '서버 오류가 발생했습니다' : err.message,
    })
  }

  res.status(500).json({ success: false, error: '알 수 없는 오류' })
}

// 에러 생성 헬퍼
export function createError(message: string, status = 400) {
  const err = new Error(message) as any
  err.status = status
  return err
}
