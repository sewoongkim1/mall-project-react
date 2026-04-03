import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Review } from '../models/index'
import { Product } from '../models/Product'
import { Order } from '../models/Order'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// ── 리뷰 작성 ──────────────────────────────────────
const CreateReviewSchema = z.object({
  productId: z.string(),
  orderId:   z.string(),
  rating:    z.number().min(1).max(5),
  content:   z.string().min(5, '리뷰는 5자 이상 작성해주세요'),
  imageUrls: z.array(z.string()).max(3).default([]),
})

export async function createReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const body = CreateReviewSchema.parse(req.body)

    // 주문 검증 (해당 상품을 구매한 유저인지)
    const order = await Order.findOne({
      _id: body.orderId,
      buyer: req.user.id,
      'items.product': body.productId,
    })
    if (!order) throw createError('해당 상품을 구매한 주문을 찾을 수 없습니다', 400)

    // 중복 리뷰 체크
    const existing = await Review.findOne({ user: req.user.id, product: body.productId, order: body.orderId })
    if (existing) throw createError('이미 리뷰를 작성했습니다', 409)

    const review = await Review.create({
      product:   body.productId,
      user:      req.user.id,
      order:     body.orderId,
      rating:    body.rating,
      content:   body.content,
      imageUrls: body.imageUrls,
    })

    // 상품 평점 업데이트
    const stats = await Review.aggregate([
      { $match: { product: review.product, isHidden: false } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    if (stats.length) {
      await Product.findByIdAndUpdate(body.productId, {
        avgRating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      })
    }

    res.status(201).json({ success: true, data: review })
  } catch (err) {
    next(err)
  }
}

// ── 상품 리뷰 목록 조회 ────────────────────────────
export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params
    const page = Number(req.query.page ?? '1')
    const limit = Number(req.query.limit ?? '10')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Review.find({ product: productId, isHidden: false })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'nickname profileImage')
        .lean(),
      Review.countDocuments({ product: productId, isHidden: false }),
    ])

    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}
