import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Product } from '../models/Product'
import { BehaviorLog } from '../models/index'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// ── 상품 목록 조회 ────────────────────────────────────
export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      category, minPrice, maxPrice, sizes,
      sort = 'latest', q,
      page = '1', limit = '20',
    } = req.query as Record<string, string>

    const filter: Record<string, any> = { status: 'ACTIVE' }
    if (category) filter.category = category
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (sizes) {
      filter['variants.size'] = { $in: sizes.split(',') }
    }
    if (q) filter.$text = { $search: q }

    const sortMap: Record<string, any> = {
      latest:    { createdAt: -1 },
      popular:   { viewCount: -1 },
      priceLow:  { price: 1 },
      priceHigh: { price: -1 },
      rating:    { avgRating: -1 },
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] ?? sortMap.latest)
        .skip(skip)
        .limit(Number(limit))
        .populate('seller', 'brandName storeImageUrl')
        .select('-description -variants')
        .lean(),
      Product.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── 상품 상세 조회 ────────────────────────────────────
export async function getProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'brandName storeImageUrl storeBio')

    if (!product) throw createError('상품을 찾을 수 없습니다', 404)
    if (product.status === 'DELETED') throw createError('삭제된 상품입니다', 404)

    // 조회수 증가
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } })

    // 행동 로그 기록
    await BehaviorLog.create({
      user:      req.user?.id,
      sessionId: req.headers['x-session-id'] as string,
      product:   product._id,
      eventType: 'VIEW',
      metadata:  { category: product.category },
    })

    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

// ── 상품 등록 (셀러) ──────────────────────────────────
const CreateProductSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().min(10),
  price:       z.number().min(100),
  category:    z.enum(['TOP','BOTTOM','OUTER','DRESS','SHOES','BAG','ACCESSORY','HAT']),
  styleTags:   z.array(z.string()).max(5).default([]),
  variants:    z.array(z.object({
    size:     z.string(),
    color:    z.string(),
    stockQty: z.number().min(0),
    sku:      z.string(),
  })).min(1),
})

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = CreateProductSchema.parse(req.body)

    // 셀러 ID 조회
    const { Seller } = await import('../models/index')
    const seller = await Seller.findOne({ user: req.user!.id })
    if (!seller) throw createError('셀러 정보를 찾을 수 없습니다', 404)
    if (seller.status !== 'APPROVED') throw createError('승인된 셀러만 상품을 등록할 수 있습니다', 403)

    const product = await Product.create({ ...body, seller: seller._id })

    res.status(201).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

// ── 상품 수정 (셀러) ──────────────────────────────────
export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { Seller } = await import('../models/index')
    const seller = await Seller.findOne({ user: req.user!.id })
    if (!seller) throw createError('셀러 정보를 찾을 수 없습니다', 404)

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: seller._id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!product) throw createError('상품을 찾을 수 없거나 권한이 없습니다', 404)

    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}
