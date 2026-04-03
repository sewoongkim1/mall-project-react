import { Response, NextFunction } from 'express'
import cloudinary from '../config/cloudinary'
import { createError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

export async function uploadImages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      throw createError('업로드할 이미지가 없습니다', 400)
    }

    const uploads = files.map(
      (file) =>
        new Promise<{ url: string; publicId: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'styleai/products',
              quality: 'auto',
              format: 'auto',
              transformation: [{ width: 1200, crop: 'limit' }],
            },
            (error, result) => {
              if (error || !result) return reject(error ?? new Error('업로드 실패'))
              resolve({ url: result.secure_url, publicId: result.public_id })
            }
          )
          stream.end(file.buffer)
        })
    )

    const results = await Promise.all(uploads)

    res.json({ success: true, data: results })
  } catch (err) {
    next(err)
  }
}
