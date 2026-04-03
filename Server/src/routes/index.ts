import { Router } from 'express'
import { authenticate, requireSeller, requireAdmin } from '../middleware/auth'

// Controllers
import * as auth       from '../controllers/auth.controller'
import * as socialAuth from '../controllers/social-auth.controller'
import * as product    from '../controllers/product.controller'
import * as ai         from '../controllers/ai.controller'
import * as seller     from '../controllers/seller.controller'
import * as upload     from '../controllers/upload.controller'
import * as wishlist   from '../controllers/wishlist.controller'
import * as order      from '../controllers/order.controller'
import * as payment    from '../controllers/payment.controller'
import * as review     from '../controllers/review.controller'
import * as stats      from '../controllers/stats.controller'
import { uploadMiddleware } from '../middleware/upload'

const router = Router()

// ── 인증 ──────────────────────────────────────────────
router.post('/auth/register',           auth.register)
router.post('/auth/login',              auth.login)
router.post('/auth/logout',             auth.logout)
router.get( '/auth/me',                 authenticate, auth.getMe)
router.put( '/auth/preferences',        authenticate, auth.updatePreferences)

// ── 소셜 로그인 ──────────────────────────────────────────
router.get( '/auth/kakao',              socialAuth.kakaoLogin)
router.get( '/auth/kakao/callback',     socialAuth.kakaoCallback)
router.get( '/auth/google',             socialAuth.googleLogin)
router.get( '/auth/google/callback',    socialAuth.googleCallback)

// ── 상품 ──────────────────────────────────────────────
router.get( '/products',                product.getProducts)
router.get( '/products/:id',            product.getProduct)
router.post('/products',                authenticate, requireSeller, product.createProduct)
router.put( '/products/:id',            authenticate, requireSeller, product.updateProduct)
router.delete('/products/:id',          authenticate, requireSeller, product.deleteProduct)

// ── 이미지 업로드 ────────────────────────────────────
router.post('/upload/images',           authenticate, requireSeller, uploadMiddleware, upload.uploadImages)

// ── AI 추천 ──────────────────────────────────────────
router.get( '/ai/recommendations',      authenticate, ai.getRecommendations)
router.get( '/ai/style-analysis',       authenticate, ai.analyzeStyle)
router.post('/ai/behavior',             ai.logBehavior)  // 비로그인도 기록

// ── 주문 ──────────────────────────────────────────────
router.post('/orders',                  authenticate, order.createOrder)
router.get( '/orders',                  authenticate, order.getMyOrders)
router.get( '/orders/:id',             authenticate, order.getOrder)
router.put( '/orders/:id/confirm',     authenticate, order.confirmPayment)
router.post('/payments/verify',        authenticate, payment.verifyAndConfirm)

// ── 셀러 주문 관리 ──────────────────────────────────
router.get( '/seller/stats',           authenticate, requireSeller, order.getSellerStats)
router.get( '/seller/orders',          authenticate, requireSeller, order.getSellerOrders)
router.put( '/seller/orders/:id',      authenticate, requireSeller, order.updateOrderStatus)

// ── 리뷰 ─────────────────────────────────────────────
router.post('/reviews',                 authenticate, review.createReview)
router.get( '/reviews/:productId',      review.getProductReviews)

// ── 위시리스트 ───────────────────────────────────────
router.post('/wishlist/:productId',     authenticate, wishlist.toggle)
router.get( '/wishlist',                authenticate, wishlist.getList)
router.get( '/wishlist/check',          authenticate, wishlist.checkStatus)

// ── 셀러 ──────────────────────────────────────────────
router.post('/seller/apply',            authenticate, seller.applySeller)
router.get( '/seller/my-status',        authenticate, seller.getMySellerStatus)
router.put( '/seller/my-info',          authenticate, requireSeller, seller.updateMySellerInfo)

// ── 관리자 ────────────────────────────────────────────
router.get( '/admin/sellers',           authenticate, requireAdmin, seller.getSellerApplications)
router.put( '/admin/sellers/:id',       authenticate, requireAdmin, seller.reviewSeller)
router.get( '/admin/users',             authenticate, requireAdmin, seller.getUsers)
router.put( '/admin/users/:id/role',    authenticate, requireAdmin, seller.changeUserRole)
router.get( '/admin/stats',            authenticate, requireAdmin, stats.getDashboardStats)

export default router
