// ── 공통 타입 ──────────────────────────────────────────

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN'

export interface Preferences {
  styles:   string[]
  sizes:    string[]
  minPrice?: number
  maxPrice?: number
}

export interface User {
  _id:         string
  email:       string
  nickname:    string
  role:        UserRole
  profileImage?: string
  isActive:    boolean
  preferences: Preferences
  createdAt:   string
}

// ── 상품 ──────────────────────────────────────────────

export type ProductCategory =
  | 'TOP' | 'BOTTOM' | 'OUTER' | 'DRESS'
  | 'SHOES' | 'BAG' | 'ACCESSORY' | 'HAT'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  TOP: '상의', BOTTOM: '하의', OUTER: '아우터', DRESS: '원피스',
  SHOES: '신발', BAG: '가방', ACCESSORY: '악세서리', HAT: '모자',
}

export type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN' | 'DELETED'

export interface ProductVariant {
  size:     string
  color:    string
  stockQty: number
  sku:      string
}

export interface Product {
  _id:         string
  name:        string
  description: string
  price:       number
  category:    ProductCategory
  styleTags:   string[]
  images:      Array<{ url: string; isMain: boolean; sortOrder: number }>
  variants:    ProductVariant[]
  status:      ProductStatus
  viewCount:   number
  avgRating:   number
  reviewCount: number
  seller:      { _id: string; brandName: string; storeImageUrl?: string }
  createdAt:   string
}

// ── 주문 ──────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING' | 'PAYMENT_CONFIRMED' | 'PREPARING'
  | 'SHIPPED' | 'DELIVERED' | 'CONFIRMED'
  | 'CANCELLED' | 'REFUNDED'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:            '주문 접수',
  PAYMENT_CONFIRMED:  '결제 완료',
  PREPARING:          '배송 준비',
  SHIPPED:            '배송 중',
  DELIVERED:          '배송 완료',
  CONFIRMED:          '구매 확정',
  CANCELLED:          '취소',
  REFUNDED:           '환불 완료',
}

export interface CartItem {
  variantId:    string
  productId:    string
  productName:  string
  productImage: string
  size:         string
  color:        string
  price:        number
  quantity:     number
  sellerName:   string
  sellerId:     string
}

// ── AI 추천 ──────────────────────────────────────────

export interface AiRecommendationItem {
  productId: string
  score:     number
  reason:    string
  product:   Product
}

// ── 공통 ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items:      T[]
  total:      number
  page:       number
  totalPages: number
}

export interface ApiResponse<T = void> {
  success: boolean
  data?:   T
  error?:  string
}
