import { Response, NextFunction } from 'express'
import { Order } from '../models/Order'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// 포트원 결제 검증 API
async function verifyPortonePayment(impUid: string): Promise<{
  amount: number; status: string; merchant_uid: string
}> {
  // 1) 액세스 토큰 발급
  const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: process.env.PORTONE_API_KEY,
      imp_secret: process.env.PORTONE_API_SECRET,
    }),
  })
  const tokenData = await tokenRes.json() as any
  if (tokenData.code !== 0) throw new Error('포트원 토큰 발급 실패')

  const accessToken = tokenData.response.access_token

  // 2) 결제 정보 조회
  const paymentRes = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const paymentData = await paymentRes.json() as any
  if (paymentData.code !== 0) throw new Error('결제 정보 조회 실패')

  return paymentData.response
}

// ── 포트원 결제 검증 + 주문 확정 ────────────────────
export async function verifyAndConfirm(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const { impUid, merchantUid } = req.body
    if (!impUid || !merchantUid) throw createError('결제 정보가 부족합니다', 400)

    // 주문 조회
    const order = await Order.findOne({ _id: merchantUid, buyer: req.user.id })
    if (!order) throw createError('주문을 찾을 수 없습니다', 404)

    // 포트원 API 키가 없으면 Mock 결제
    if (!process.env.PORTONE_API_KEY || !process.env.PORTONE_API_SECRET) {
      order.status = 'PAYMENT_CONFIRMED'
      order.payment = {
        method: 'CARD',
        pgTransactionId: impUid,
        amount: order.totalAmount,
        paidAt: new Date(),
      }
      order.items.forEach((item: any) => { item.status = 'PAYMENT_CONFIRMED' })
      await order.save()
      return res.json({ success: true, data: order })
    }

    // 포트원 결제 검증
    const payment = await verifyPortonePayment(impUid)

    // 금액 일치 검증
    if (payment.amount !== order.totalAmount) {
      throw createError(`결제 금액 불일치: 주문 ${order.totalAmount}원 / 결제 ${payment.amount}원`, 400)
    }

    if (payment.status === 'paid') {
      order.status = 'PAYMENT_CONFIRMED'
      order.payment = {
        method: 'CARD',
        pgTransactionId: impUid,
        amount: payment.amount,
        paidAt: new Date(),
      }
      order.items.forEach((item: any) => { item.status = 'PAYMENT_CONFIRMED' })
      await order.save()
      res.json({ success: true, data: order })
    } else {
      throw createError(`결제 상태 이상: ${payment.status}`, 400)
    }
  } catch (err) {
    next(err)
  }
}
