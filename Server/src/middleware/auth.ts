import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

export interface AuthRequest extends Request {
  user?: { id: string; role: string }
}

// 로그인 필수
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; role: string
    }

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다' })
  }
}

// 셀러 권한 체크
export function requireSeller(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'SELLER' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: '셀러 권한이 필요합니다' })
  }
  next()
}

// 관리자 권한 체크
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: '관리자 권한이 필요합니다' })
  }
  next()
}
