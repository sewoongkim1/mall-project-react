import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { connectDB } from './config/db'
import routes from './routes/index'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 5000

// ── 보안 미들웨어 ──────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(u => u.trim())
    : 'http://localhost:5173',
  credentials: true,  // 쿠키 허용
}))

// ── Rate Limiting ─────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max:      20,               // 최대 20회
  message:  { success: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
}))

app.use('/api/ai', rateLimit({
  windowMs: 60 * 1000,  // 1분
  max:      10,          // AI API 비용 보호
}))

// ── 기본 미들웨어 ──────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── 헬스체크 ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  const dbState = require('mongoose').connection.readyState
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected'

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? 'development',
    db: dbStatus,
  })
})

// ── API 라우트 ─────────────────────────────────────────
app.use('/api', routes)

// ── 에러 핸들러 ───────────────────────────────────────
app.use(errorHandler)

// ── 서버 시작 ──────────────────────────────────────────
async function bootstrap() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 StyleAI 서버 실행 중: http://localhost:${PORT}`)
    console.log(`📋 환경: ${process.env.NODE_ENV ?? 'development'}`)
  })
}

bootstrap()
