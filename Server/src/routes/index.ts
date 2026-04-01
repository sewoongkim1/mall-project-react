import { Router } from 'express'
import { authenticate, requireSeller, requireAdmin } from '../middleware/auth'

// Controllers
import * as auth       from '../controllers/auth.controller'
import * as socialAuth from '../controllers/social-auth.controller'
import * as product    from '../controllers/product.controller'
import * as ai         from '../controllers/ai.controller'

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

// ── AI 추천 ──────────────────────────────────────────
router.get( '/ai/recommendations',      authenticate, ai.getRecommendations)
router.post('/ai/behavior',             ai.logBehavior)  // 비로그인도 기록

// ── 주문 (향후 구현) ──────────────────────────────────
// router.post('/orders',               authenticate, order.createOrder)
// router.get( '/orders',               authenticate, order.getMyOrders)
// router.get( '/orders/:id',           authenticate, order.getOrder)

// ── 위시리스트 (향후 구현) ────────────────────────────
// router.post('/wishlist/:productId',  authenticate, wishlist.toggle)
// router.get( '/wishlist',             authenticate, wishlist.getList)

// ── 셀러 (향후 구현) ──────────────────────────────────
// router.get( '/seller/dashboard',     authenticate, requireSeller, seller.getDashboard)
// router.get( '/seller/orders',        authenticate, requireSeller, seller.getOrders)

// ── 관리자 (향후 구현) ────────────────────────────────
// router.get( '/admin/users',          authenticate, requireAdmin, admin.getUsers)

export default router
