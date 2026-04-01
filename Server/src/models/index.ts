import mongoose, { Schema, Document, Types } from 'mongoose'

// ── Seller ──────────────────────────────────────────
export interface ISeller extends Document {
  user:            Types.ObjectId
  brandName:       string
  businessNumber:  string
  bankAccount:     string
  bankName:        string
  status:          'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  commissionRate:  number
  storeBio?:       string
  storeImageUrl?:  string
  bannerImageUrl?: string
  approvedAt?:     Date
  createdAt:       Date
}

const SellerSchema = new Schema<ISeller>(
  {
    user:           { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    brandName:      { type: String, required: true, unique: true, trim: true },
    businessNumber: { type: String, required: true, unique: true },
    bankAccount:    { type: String, required: true },
    bankName:       { type: String, required: true },
    status:         { type: String, enum: ['PENDING','APPROVED','SUSPENDED','REJECTED'], default: 'PENDING' },
    commissionRate: { type: Number, default: 0.05 },
    storeBio:       String,
    storeImageUrl:  String,
    bannerImageUrl: String,
    approvedAt:     Date,
  },
  { timestamps: true }
)

export const Seller = mongoose.model<ISeller>('Seller', SellerSchema)

// ── Review ──────────────────────────────────────────
export interface IReview extends Document {
  product:   Types.ObjectId
  user:      Types.ObjectId
  order:     Types.ObjectId
  rating:    number
  content:   string
  imageUrls: string[]
  isHidden:  boolean
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product:   { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order:     { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    content:   { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    isHidden:  { type: Boolean, default: false },
  },
  { timestamps: true }
)

ReviewSchema.index({ product: 1, createdAt: -1 })
ReviewSchema.index({ user: 1 })

export const Review = mongoose.model<IReview>('Review', ReviewSchema)

// ── BehaviorLog (AI 추천 데이터) ─────────────────────
export interface IBehaviorLog extends Document {
  user?:      Types.ObjectId
  sessionId?: string
  product?:   Types.ObjectId
  eventType:  'VIEW' | 'CLICK' | 'WISHLIST' | 'CART_ADD' | 'PURCHASE' | 'SEARCH'
  metadata:   Record<string, unknown>
  occurredAt: Date
}

const BehaviorLogSchema = new Schema<IBehaviorLog>({
  user:      { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  product:   { type: Schema.Types.ObjectId, ref: 'Product' },
  eventType: {
    type: String,
    enum: ['VIEW','CLICK','WISHLIST','CART_ADD','PURCHASE','SEARCH'],
    required: true,
  },
  metadata:  { type: Schema.Types.Mixed, default: {} },
  occurredAt: { type: Date, default: Date.now },
})

BehaviorLogSchema.index({ user: 1, occurredAt: -1 })
BehaviorLogSchema.index({ product: 1 })
BehaviorLogSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }) // 90일 TTL

export const BehaviorLog = mongoose.model<IBehaviorLog>('BehaviorLog', BehaviorLogSchema)

// ── Wishlist ─────────────────────────────────────────
export interface IWishlist extends Document {
  user:      Types.ObjectId
  product:   Types.ObjectId
  createdAt: Date
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
)

WishlistSchema.index({ user: 1, product: 1 }, { unique: true })

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema)
