import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다')
  }

  try {
    await mongoose.connect(uri)
    console.log('✅ MongoDB 연결 성공')

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 에러:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 연결 끊김 — 재연결 시도 중...')
    })

  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error)
    process.exit(1)
  }
}
