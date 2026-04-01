import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IVariant {
  size: string
  color: string
  stockQty: number
  sku: string
}

export interface IProduct extends Document {
  seller: Types.ObjectId
  name: string
  description: string
  price: number
  category: 'TOP' | 'BOTTOM' | 'OUTER' | 'DRESS' | 'SHOES' | 'BAG' | 'ACCESSORY' | 'HAT'
  styleTags: string[]
  images: Array<{ url: string; isMain: boolean; sortOrder: number }>
  variants: IVariant[]
  status: 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN' | 'DELETED'
  viewCount: number
  avgRating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

const VariantSchema = new Schema<IVariant>({
  size:     { type: String, required: true },
  color:    { type: String, required: true },
  stockQty: { type: Number, required: true, min: 0, default: 0 },
  sku:      { type: String, required: true, unique: true },
})

const ProductSchema = new Schema<IProduct>(
  {
    seller:   { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    name:     { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:    { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['TOP','BOTTOM','OUTER','DRESS','SHOES','BAG','ACCESSORY','HAT'],
      required: true,
    },
    styleTags: { type: [String], default: [] },
    images: [
      {
        url:       { type: String, required: true },
        isMain:    { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    variants:    [VariantSchema],
    status:      { type: String, enum: ['ACTIVE','SOLD_OUT','HIDDEN','DELETED'], default: 'ACTIVE' },
    viewCount:   { type: Number, default: 0 },
    avgRating:   { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// 검색 인덱스
ProductSchema.index({ name: 'text', description: 'text', styleTags: 'text' })
ProductSchema.index({ category: 1, status: 1 })
ProductSchema.index({ seller: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ viewCount: -1 })
ProductSchema.index({ createdAt: -1 })

export const Product = mongoose.model<IProduct>('Product', ProductSchema)
