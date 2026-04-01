import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { Seller } from '../models/index'
import { User } from '../models/User'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

// ── 셀러 신청 ──────────────────────────────────────────
const ApplySchema = z.object({
  brandName:      z.string().min(2, '브랜드명은 2자 이상이어야 합니다'),
  businessNumber: z.string().min(10, '사업자등록번호를 정확히 입력해주세요'),
  bankName:       z.string().min(1, '은행명을 입력해주세요'),
  bankAccount:    z.string().min(5, '계좌번호를 입력해주세요'),
  storeBio:       z.string().optional(),
})

export async function applySeller(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    // 이미 셀러 신청했는지 확인
    const existing = await Seller.findOne({ user: req.user.id })
    if (existing) throw createError('이미 셀러 신청이 존재합니다', 409)

    const body = ApplySchema.parse(req.body)

    const seller = await Seller.create({
      user:           req.user.id,
      brandName:      body.brandName,
      businessNumber: body.businessNumber,
      bankName:       body.bankName,
      bankAccount:    body.bankAccount,
      storeBio:       body.storeBio,
      status:         'PENDING',
    })

    res.status(201).json({ success: true, data: seller })
  } catch (err) {
    next(err)
  }
}

// ── 내 셀러 상태 조회 ─────────────────────────────────
export async function getMySellerStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const seller = await Seller.findOne({ user: req.user.id })
    if (!seller) {
      return res.json({ success: true, data: null })
    }

    res.json({ success: true, data: seller })
  } catch (err) {
    next(err)
  }
}

// ── 셀러 정보 수정 ────────────────────────────────────
const UpdateSellerSchema = z.object({
  brandName:   z.string().min(2).optional(),
  bankName:    z.string().min(1).optional(),
  bankAccount: z.string().min(5).optional(),
  storeBio:    z.string().optional(),
})

export async function updateMySellerInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createError('로그인이 필요합니다', 401)

    const seller = await Seller.findOne({ user: req.user.id })
    if (!seller) throw createError('셀러 정보가 없습니다', 404)
    if (seller.status !== 'APPROVED') throw createError('승인된 셀러만 정보를 수정할 수 있습니다', 403)

    const body = UpdateSellerSchema.parse(req.body)

    if (body.brandName)   seller.brandName   = body.brandName
    if (body.bankName)    seller.bankName    = body.bankName
    if (body.bankAccount) seller.bankAccount = body.bankAccount
    if (body.storeBio !== undefined) seller.storeBio = body.storeBio

    await seller.save()

    res.json({ success: true, data: seller })
  } catch (err) {
    next(err)
  }
}

// ── [관리자] 셀러 신청 목록 조회 ───────────────────────
export async function getSellerApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}

    const sellers = await Seller.find(filter)
      .populate('user', 'email nickname profileImage createdAt')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: sellers })
  } catch (err) {
    next(err)
  }
}

// ── [관리자] 셀러 승인/거절 ────────────────────────────
const ReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
})

export async function reviewSeller(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const body = ReviewSchema.parse(req.body)

    const seller = await Seller.findById(id)
    if (!seller) throw createError('셀러를 찾을 수 없습니다', 404)

    seller.status = body.status
    if (body.status === 'APPROVED') {
      seller.approvedAt = new Date()
      // User role을 SELLER로 변경
      await User.findByIdAndUpdate(seller.user, { role: 'SELLER' })
    } else if (body.status === 'REJECTED' || body.status === 'SUSPENDED') {
      // User role을 BUYER로 되돌림
      await User.findByIdAndUpdate(seller.user, { role: 'BUYER' })
    }

    await seller.save()

    const populated = await Seller.findById(id).populate('user', 'email nickname profileImage')

    res.json({ success: true, data: populated })
  } catch (err) {
    next(err)
  }
}

// ── [관리자] 전체 회원 목록 ────────────────────────────
export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, page = '1', limit = '20' } = req.query
    const filter = role ? { role } : {}
    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: {
        items: users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── [관리자] 회원 역할 변경 ────────────────────────────
const ChangeRoleSchema = z.object({
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']),
})

export async function changeUserRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const body = ChangeRoleSchema.parse(req.body)

    const user = await User.findByIdAndUpdate(id, { role: body.role }, { new: true })
    if (!user) throw createError('사용자를 찾을 수 없습니다', 404)

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}
