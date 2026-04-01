import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  passwordHash?: string
  nickname: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  profileImage?: string
  isActive: boolean
  provider?: 'EMAIL' | 'KAKAO' | 'GOOGLE'
  providerId?: string
  // AI 추천용 취향
  preferences: {
    styles: string[]
    sizes: string[]
    minPrice?: number
    maxPrice?: number
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String },
    nickname: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['BUYER', 'SELLER', 'ADMIN'],
      default: 'BUYER',
    },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    provider: {
      type: String,
      enum: ['EMAIL', 'KAKAO', 'GOOGLE'],
      default: 'EMAIL',
    },
    providerId: { type: String },
    preferences: {
      styles: { type: [String], default: [] },
      sizes:  { type: [String], default: [] },
      minPrice: { type: Number },
      maxPrice: { type: Number },
    },
  },
  { timestamps: true }
)

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = async function (password: string) {
  if (!this.passwordHash) return false
  return bcrypt.compare(password, this.passwordHash)
}

// 비밀번호 해시화 (저장 전)
UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && this.passwordHash) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  }
  next()
})

// toJSON 에서 passwordHash 제거
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash
    return ret
  },
})

export const User = mongoose.model<IUser>('User', UserSchema)
