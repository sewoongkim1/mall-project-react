import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { Order } from '../models/Order'
import { Product } from '../models/Product'
import { BehaviorLog } from '../models/index'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// 주문번호 생성
function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${date}-${rand}`
}

// ── 주문 생성 ───────────────────────────────────────
const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId:    z.string(),
    variantSku:   z.string(),
    productName:  z.string(),
    productImage: z.string().optional(),
    size:         z.string(),
    color:        z.string(),
    price:        z.number(),
    quantity:     z.number().min(1),
    sellerName:   z.string(),
    sellerId:     z.string(),
  })).min(1),
  shippingAddress: z.object({
    name:          z.string().min(1, '수령인을 입력해주세요'),
    phone:         z.string().min(10, '연락처를 입력해주세요'),
    zipCode:       z.string().min(1, '우편번호를 입력해주세요'),
    address:       z.string().min(1, '주소를 입력해주세요'),
    detailAddress: z.string().default(''),
    memo:          z.string().default(''),
  }),
})

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    console.log('주문 요청 body:', JSON.stringify(req.body).substring(0, 500))
    const body = CreateOrderSchema.parse(req.body)

    // 재고 차감
    for (const item of body.items) {
      const result = await Product.updateOne(
        { _id: item.productId, 'variants.sku': item.variantSku, 'variants.stockQty': { $gte: item.quantity } },
        { $inc: { 'variants.$.stockQty': -item.quantity } }
      )
      if (result.modifiedCount === 0) {
        throw createError(`${item.productName} (${item.size}/${item.color})의 재고가 부족합니다`, 400)
      }
    }

    // 금액 계산
    const totalProductPrice = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingFee = totalProductPrice >= 50000 ? 0 : 3000
    const totalAmount = totalProductPrice + shippingFee

    // 주문 생성
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: req.user.id,
      items: body.items.map(item => ({
        product: item.productId,
        seller: item.sellerId,
        name: item.productName,
        image: item.productImage ?? '',
        variant: { size: item.size, color: item.color, sku: item.variantSku },
        quantity: item.quantity,
        price: item.price,
        status: 'PENDING',
      })),
      shippingAddress: body.shippingAddress,
      totalAmount,
      shippingAmount: shippingFee,
      status: 'PENDING',
    })

    // 행동 로그
    for (const item of body.items) {
      await BehaviorLog.create({
        user: req.user.id, product: item.productId, eventType: 'PURCHASE',
        metadata: { orderId: order._id, quantity: item.quantity },
      })
    }

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

// ── 내 주문 목록 ────────────────────────────────────
export async function getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const page = Number(req.query.page ?? '1')
    const limit = Number(req.query.limit ?? '10')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Order.find({ buyer: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ buyer: req.user.id }),
    ])

    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// ── 주문 상세 ───────────────────────────────────────
export async function getOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id })
    if (!order) throw createError('주문을 찾을 수 없습니다', 404)

    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

// ── 주문 상태 변경 (결제 확인) ──────────────────────
export async function confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id })
    if (!order) throw createError('주문을 찾을 수 없습니다', 404)

    const { paymentMethod, pgTransactionId } = req.body

    order.status = 'PAYMENT_CONFIRMED'
    order.payment = {
      method: paymentMethod ?? 'CARD',
      pgTransactionId: pgTransactionId ?? `MOCK-${Date.now()}`,
      amount: order.totalAmount,
      paidAt: new Date(),
    }
    order.items.forEach((item: any) => { item.status = 'CONFIRMED' })
    await order.save()

    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

// ── [셀러] 대시보드 통계 ─────────────────────────────
export async function getSellerStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const { Seller } = await import('../models/index')
    const seller = await Seller.findOne({ user: req.user.id })
    if (!seller) throw createError('셀러 정보가 없습니다', 404)

    const productCount = await Product.countDocuments({ seller: seller._id, status: { $ne: 'DELETED' } })
    const orders = await Order.find({ 'items.seller': seller._id, status: { $ne: 'CANCELLED' } }).lean()
    const totalRevenue = orders.reduce((sum, o: any) => {
      const sellerItems = o.items.filter((i: any) => String(i.seller) === String(seller._id))
      return sum + sellerItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    }, 0)

    res.json({
      success: true,
      data: { productCount, orderCount: orders.length, totalRevenue },
    })
  } catch (err) {
    next(err)
  }
}

// ── [셀러] 내 주문 조회 ─────────────────────────────
export async function getSellerOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const { Seller } = await import('../models/index')
    const seller = await Seller.findOne({ user: req.user.id })
    if (!seller) throw createError('셀러 정보가 없습니다', 404)

    const { status: statusFilter } = req.query
    const page = Number(req.query.page ?? '1')
    const limit = Number(req.query.limit ?? '20')
    const skip = (page - 1) * limit

    const filter: Record<string, any> = { 'items.seller': seller._id }
    if (statusFilter) filter.status = statusFilter

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('buyer', 'nickname email')
        .lean(),
      Order.countDocuments(filter),
    ])

    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// ── [셀러] 주문 상태 변경 + 운송장 입력 ─────────────
const UpdateOrderSchema = z.object({
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingCarrier: z.string().optional(),
  trackingNumber:  z.string().optional(),
})

export async function updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const { Seller } = await import('../models/index')
    const seller = await Seller.findOne({ user: req.user.id })
    if (!seller) throw createError('셀러 정보가 없습니다', 404)

    const body = UpdateOrderSchema.parse(req.body)
    const order = await Order.findOne({ _id: req.params.id, 'items.seller': seller._id })
    if (!order) throw createError('주문을 찾을 수 없습니다', 404)

    order.status = body.status as any
    order.items.forEach((item: any) => {
      if (String(item.seller) === String(seller._id)) {
        item.status = body.status === 'SHIPPED' ? 'SHIPPED'
          : body.status === 'DELIVERED' ? 'DELIVERED'
          : body.status === 'CANCELLED' ? 'CANCELLED'
          : 'PREPARING'
        if (body.status === 'SHIPPED' && body.trackingCarrier && body.trackingNumber) {
          item.tracking = { carrier: body.trackingCarrier, number: body.trackingNumber }
        }
      }
    })
    await order.save()

    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}
