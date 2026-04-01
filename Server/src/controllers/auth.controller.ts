import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User'
import { createError } from '../middleware/errorHandler'

// 토큰 발급 헬퍼
function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
  )
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d' } as jwt.SignOptions
  )
  return { accessToken, refreshToken }
}

// 쿠키 옵션
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
}

// ── 회원가입 ──────────────────────────────────────────
const RegisterSchema = z.object({
  email:    z.string().email('이메일 형식이 올바르지 않습니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
})

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = RegisterSchema.parse(req.body)

    const existing = await User.findOne({ email: body.email })
    if (existing) throw createError('이미 사용 중인 이메일입니다', 409)

    const user = await User.create({
      email:        body.email,
      passwordHash: body.password, // pre-save 훅에서 해시화
      nickname:     body.nickname,
    })

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    })
  } catch (err) {
    next(err)
  }
}

// ── 로그인 ──────────────────────────────────────────
const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = LoginSchema.parse(req.body)

    const user = await User.findOne({ email: body.email }).select('+passwordHash')
    if (!user) throw createError('이메일 또는 비밀번호가 올바르지 않습니다', 401)
    if (!user.isActive) throw createError('비활성화된 계정입니다', 403)

    const isMatch = await user.comparePassword(body.password)
    if (!isMatch) throw createError('이메일 또는 비밀번호가 올바르지 않습니다', 401)

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

    res.json({ success: true, data: { user, accessToken } })
  } catch (err) {
    next(err)
  }
}

// ── 로그아웃 ──────────────────────────────────────────
export function logout(_req: Request, res: Response) {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.json({ success: true })
}

// ── 현재 유저 조회 ──────────────────────────────────────
export async function getMe(req: any, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) throw createError('사용자를 찾을 수 없습니다', 404)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

// ── 취향 설정 저장 ────────────────────────────────────
const PreferenceSchema = z.object({
  styles:   z.array(z.string()).max(10),
  sizes:    z.array(z.string()),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
})

export async function updatePreferences(req: any, res: Response, next: NextFunction) {
  try {
    const body = PreferenceSchema.parse(req.body)
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: body },
      { new: true }
    )
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}
