import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

// ── 토큰 & 쿠키 헬퍼 (auth.controller와 동일) ──────────
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

const isProduction = process.env.NODE_ENV === 'production'
const COOKIE_OPTIONS: {
  httpOnly: boolean; secure: boolean; sameSite: 'none' | 'lax'; maxAge: number
} = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

// 소셜 로그인 후 프론트로 리다이렉트할 URL
function getClientRedirectUrl(accessToken: string) {
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  return `${clientUrl}/auth/social-callback?token=${accessToken}`
}

// ── 공통: 소셜 유저 찾기/생성 ────────────────────────────
async function findOrCreateSocialUser(
  provider: 'KAKAO' | 'GOOGLE',
  providerId: string,
  email: string,
  nickname: string,
  profileImage?: string
) {
  // 1) providerId로 기존 유저 검색
  let user = await User.findOne({ provider, providerId })
  if (user) return user

  // 2) 이메일로 기존 유저 검색 (이메일 가입 후 소셜 연동)
  user = await User.findOne({ email })
  if (user) {
    user.provider = provider
    user.providerId = providerId
    if (profileImage) user.profileImage = profileImage
    await user.save()
    return user
  }

  // 3) 신규 생성
  user = await User.create({
    email,
    nickname,
    provider,
    providerId,
    profileImage,
  })
  return user
}

// ══════════════════════════════════════════════════════════
//  카카오 로그인
// ══════════════════════════════════════════════════════════

// GET /api/auth/kakao → 카카오 인증 페이지로 리다이렉트
export function kakaoLogin(_req: Request, res: Response) {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(process.env.KAKAO_REDIRECT_URI!)}&response_type=code`
  res.redirect(kakaoAuthUrl)
}

// GET /api/auth/kakao/callback → 인가코드로 토큰 교환 → 유저 정보 → JWT 발급
export async function kakaoCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.query
    if (!code) return res.status(400).json({ success: false, error: '인가코드가 없습니다' })

    // 1) 인가코드 → Access Token
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY!,
        redirect_uri: process.env.KAKAO_REDIRECT_URI!,
        code: code as string,
        ...(process.env.KAKAO_CLIENT_SECRET && { client_secret: process.env.KAKAO_CLIENT_SECRET }),
      }),
    })
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string }
    if (!tokenData.access_token) {
      console.error('카카오 토큰 에러:', tokenData)
      return res.status(401).json({ success: false, error: '카카오 토큰 발급 실패', detail: tokenData })
    }

    // 2) Access Token → 유저 정보
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const kakaoUser = await userRes.json() as {
      id: number
      kakao_account?: {
        email?: string
        profile?: { nickname?: string; profile_image_url?: string }
      }
    }

    const kakaoAccount = kakaoUser.kakao_account
    const email = kakaoAccount?.email ?? `kakao_${kakaoUser.id}@styleai.local`
    const nickname = kakaoAccount?.profile?.nickname ?? `카카오유저${kakaoUser.id}`
    const profileImage = kakaoAccount?.profile?.profile_image_url

    // 3) 유저 찾기/생성
    const user = await findOrCreateSocialUser('KAKAO', String(kakaoUser.id), email, nickname, profileImage)

    // 4) JWT 발급 + 쿠키 + 프론트로 리다이렉트
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.redirect(getClientRedirectUrl(accessToken))
  } catch (err) {
    next(err)
  }
}

// ══════════════════════════════════════════════════════════
//  구글 로그인
// ══════════════════════════════════════════════════════════

// GET /api/auth/google → 구글 인증 페이지로 리다이렉트
export function googleLogin(_req: Request, res: Response) {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI!)}&response_type=code&scope=openid%20email%20profile&access_type=offline`
  res.redirect(googleAuthUrl)
}

// GET /api/auth/google/callback → 인가코드로 토큰 교환 → 유저 정보 → JWT 발급
export async function googleCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.query
    if (!code) return res.status(400).json({ success: false, error: '인가코드가 없습니다' })

    // 1) 인가코드 → Access Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        code: code as string,
      }),
    })
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
    if (!tokenData.access_token) {
      return res.status(401).json({ success: false, error: '구글 토큰 발급 실패' })
    }

    // 2) Access Token → 유저 정보
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const googleUser = await userRes.json() as {
      id: string; email: string; name: string; picture?: string
    }

    // 3) 유저 찾기/생성
    const user = await findOrCreateSocialUser('GOOGLE', googleUser.id, googleUser.email, googleUser.name, googleUser.picture)

    // 4) JWT 발급 + 쿠키 + 프론트로 리다이렉트
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.redirect(getClientRedirectUrl(accessToken))
  } catch (err) {
    next(err)
  }
}
