import { Response, NextFunction } from 'express'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { Order } from '../models/Order'
import { BehaviorLog } from '../models/index'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

export async function getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalUsers, totalProducts, totalOrders,
      thisMonthOrders, lastMonthOrders,
      thisMonthRevenue, lastMonthRevenue,
      recentOrders, usersByRole, behaviorStats,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'ACTIVE' }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonthStart }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonthStart, $lt: thisMonthStart }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('buyer', 'nickname').lean(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      BehaviorLog.aggregate([
        { $match: { occurredAt: { $gte: thisMonthStart } } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
      ]),
    ])

    const thisRevenue = thisMonthRevenue[0]?.total ?? 0
    const lastRevenue = lastMonthRevenue[0]?.total ?? 0

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalProducts,
          totalOrders,
          thisMonthRevenue: thisRevenue,
        },
        comparison: {
          orders: { current: thisMonthOrders, previous: lastMonthOrders },
          revenue: { current: thisRevenue, previous: lastRevenue },
        },
        recentOrders: recentOrders.map((o: any) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          buyerName: o.buyer?.nickname ?? '탈퇴회원',
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt,
        })),
        usersByRole: Object.fromEntries(usersByRole.map((r: any) => [r._id, r.count])),
        behaviorStats: Object.fromEntries(behaviorStats.map((b: any) => [b._id, b.count])),
      },
    })
  } catch (err) {
    next(err)
  }
}
