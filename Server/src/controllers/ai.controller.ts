import { Response, NextFunction } from 'express'
import { anthropic, CLAUDE_MODEL } from '../config/anthropic'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { BehaviorLog } from '../models/index'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// 추천 캐시 (메모리, 실서비스에서는 Redis 사용)
const recommendCache = new Map<string, { data: any; expiresAt: number }>()

export async function getRecommendations(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    // Anthropic API 키가 없으면 빈 결과 반환
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ success: true, data: [], cached: false, message: 'AI 추천 미설정 (API 키 필요)' })
    }

    const userId = req.user.id

    // 1. 캐시 확인 (1시간)
    const cached = recommendCache.get(userId)
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ success: true, data: cached.data, cached: true })
    }

    // 2. 유저 취향 + 행동 로그 조회
    const [user, recentLogs] = await Promise.all([
      User.findById(userId),
      BehaviorLog.find({
        user: userId,
        occurredAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
        .populate('product', 'category name')
        .sort({ occurredAt: -1 })
        .limit(50)
        .lean(),
    ])

    if (!user) throw createError('사용자를 찾을 수 없습니다', 404)

    // 3. 후보 상품 조회
    const candidateProducts = await Product.find({
      status: 'ACTIVE',
      ...(user.preferences.sizes.length
        ? { 'variants.size': { $in: user.preferences.sizes } }
        : {}),
    })
      .sort({ viewCount: -1 })
      .limit(50)
      .populate('seller', 'brandName')
      .lean()

    // 4. 행동 요약
    const getCategories = (type: string) =>
      [...new Set(
        recentLogs
          .filter((l: any) => l.eventType === type && l.product)
          .map((l: any) => (l.product as any).category)
      )].slice(0, 5)

    const behaviorSummary = {
      recentViews:          getCategories('VIEW'),
      wishlistCategories:   getCategories('WISHLIST'),
      purchasedCategories:  getCategories('PURCHASE'),
    }

    // 5. Claude API 프롬프트
    const prompt = `당신은 AI 패션 큐레이터입니다. 사용자 데이터를 분석해 최적의 상품을 추천하세요.

## 사용자 취향
- 선호 스타일: ${user.preferences.styles.join(', ') || '미설정'}
- 선호 사이즈: ${user.preferences.sizes.join(', ') || '미설정'}
- 가격대: ${user.preferences.minPrice?.toLocaleString() ?? '제한없음'}원 ~ ${user.preferences.maxPrice?.toLocaleString() ?? '제한없음'}원

## 최근 행동 패턴 (30일)
- 최근 본 카테고리: ${behaviorSummary.recentViews.join(', ') || '없음'}
- 찜한 카테고리: ${behaviorSummary.wishlistCategories.join(', ') || '없음'}
- 구매한 카테고리: ${behaviorSummary.purchasedCategories.join(', ') || '없음'}

## 추천 후보 상품
${candidateProducts
  .map(p => `- ID:${p._id} | ${p.name} | ${p.category} | ${p.price.toLocaleString()}원 | 태그:${(p.styleTags ?? []).join(',')}`)
  .join('\n')}

상위 8개 상품을 추천하세요. 반드시 아래 JSON 형식만 반환하세요:
{"recommendations":[{"productId":"id","score":0.95,"reason":"추천 이유 한 문장"}]}`

    const message = await anthropic.messages.create({
      model:      CLAUDE_MODEL,
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const parsed = JSON.parse(text)

    // 6. 상품 상세 정보 보강
    const productIds = parsed.recommendations.map((r: any) => r.productId)
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('seller', 'brandName')
      .lean()

    const result = parsed.recommendations.map((rec: any) => ({
      ...rec,
      product: products.find(p => String(p._id) === rec.productId),
    })).filter((r: any) => r.product)

    // 7. 캐시 저장 (1시간)
    recommendCache.set(userId, {
      data:      result,
      expiresAt: Date.now() + 60 * 60 * 1000,
    })

    res.json({ success: true, data: result, cached: false })
  } catch (err) {
    next(err)
  }
}

// 행동 로그 기록
export async function logBehavior(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, eventType, metadata } = req.body

    await BehaviorLog.create({
      user:      req.user?.id,
      sessionId: req.headers['x-session-id'],
      product:   productId,
      eventType,
      metadata:  metadata ?? {},
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
