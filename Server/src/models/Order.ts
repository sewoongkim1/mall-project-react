import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IOrderItem {
  product:   Types.ObjectId
  variant:   { size: string; color: string; sku: string }
  seller:    Types.ObjectId
  name:      string
  image:     string
  price:     number
  quantity:  number
  status:    'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CONFIRMED_PURCHASE' | 'CANCELLED' | 'REFUNDED'
  tracking?: { carrier: string; number: string }
}

export interface IOrder extends Document {
  buyer:         Types.ObjectId
  orderNumber:   string
  items:         IOrderItem[]
  totalAmount:   number
  shippingAmount: number
  discountAmount: number
  status:        'PENDING' | 'PAYMENT_CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
  shippingAddress: {
    name: string; phone: string; zipCode: string
    address: string; detailAddress: string; memo?: string
  }
  payment?: {
    method: string; pgTransactionId: string
    amount: number; paidAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant:  { size: String, color: String, sku: String },
  seller:   { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  status:   {
    type: String,
    enum: ['PENDING','CONFIRMED','PREPARING','SHIPPED','DELIVERED','CONFIRMED_PURCHASE','CANCELLED','REFUNDED'],
    default: 'PENDING',
  },
  tracking: { carrier: String, number: String },
})

const OrderSchema = new Schema<IOrder>(
  {
    buyer:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber:  { type: String, required: true, unique: true },
    items:        [OrderItemSchema],
    totalAmount:  { type: Number, required: true },
    shippingAmount: { type: Number, default: 3000 },
    discountAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING','PAYMENT_CONFIRMED','PREPARING','SHIPPED','DELIVERED','CONFIRMED','CANCELLED','REFUNDED'],
      default: 'PENDING',
    },
    shippingAddress: {
      name:          { type: String, required: true },
      phone:         { type: String, required: true },
      zipCode:       { type: String, required: true },
      address:       { type: String, required: true },
      detailAddress: { type: String, required: true },
      memo:          { type: String },
    },
    payment: {
      method:          String,
      pgTransactionId: String,
      amount:          Number,
      paidAt:          Date,
    },
  },
  { timestamps: true }
)

OrderSchema.index({ buyer: 1, createdAt: -1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ 'items.seller': 1, status: 1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
