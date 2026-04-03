import { Response, NextFunction } from 'express'
import { Wishlist, BehaviorLog } from '../models/index'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// ── 찜 토글 ─────────────────────────────────────────
export async function toggle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const { productId } = req.params
    const existing = await Wishlist.findOne({ user: req.user.id, product: productId })

    if (existing) {
      await existing.deleteOne()
      res.json({ success: true, data: { wishlisted: false } })
    } else {
      await Wishlist.create({ user: req.user.id, product: productId })
      await BehaviorLog.create({
        user: req.user.id, product: productId, eventType: 'WISHLIST',
      })
      res.json({ success: true, data: { wishlisted: true } })
    }
  } catch (err) {
    next(err)
  }
}

// ── 찜 목록 조회 ────────────────────────────────────
export async function getList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const page = Number(req.query.page ?? '1')
    const limit = Number(req.query.limit ?? '20')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Wishlist.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate({ path: 'product', match: { status: 'ACTIVE' }, populate: { path: 'seller', select: 'brandName' } })
        .lean(),
      Wishlist.countDocuments({ user: req.user.id }),
    ])

    const filtered = items.filter((w: any) => w.product)

    res.json({
      success: true,
      data: { items: filtered.map((w: any) => w.product), total, page, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
}

// ── 찜 상태 일괄 조회 ───────────────────────────────
export async function checkStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.json({ success: true, data: {} })

    const ids = ((req.query.productIds as string) ?? '').split(',').filter(Boolean)
    if (!ids.length) return res.json({ success: true, data: {} })

    const wishlisted = await Wishlist.find({ user: req.user.id, product: { $in: ids } }).lean()
    const map: Record<string, boolean> = {}
    ids.forEach(id => { map[id] = false })
    wishlisted.forEach((w: any) => { map[String(w.product)] = true })

    res.json({ success: true, data: map })
  } catch (err) {
    next(err)
  }
}
