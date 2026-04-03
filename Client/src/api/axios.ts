import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,   // 쿠키(JWT) 자동 포함
  timeout:         10_000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터 — Authorization 헤더 추가
api.interceptors.request.use((config) => {
  try {
    // 1) Zustand store에서 토큰 확인
    const stored = localStorage.getItem('styleai-auth')
    if (stored) {
      const token = JSON.parse(stored)?.state?.accessToken
      if (token) { config.headers.Authorization = `Bearer ${token}`; return config }
    }
    // 2) fallback: access_token 키 확인
    const fallback = localStorage.getItem('access_token')
    if (fallback) {
      config.headers.Authorization = `Bearer ${fallback}`
    }
  } catch { /* 무시 */ }
  return config
})

// 응답 인터셉터 — 공통 에러 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? '서버 오류가 발생했습니다'

    // 401: 로그인 필요 (auth/me 실패는 조용히 무시)
    if (err.response?.status === 401) {
      const url = err.config?.url ?? ''
      if (url.includes('/auth/me')) {
        return Promise.reject(err)
      }
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = `/login?redirectTo=${window.location.pathname}`
      }
      return Promise.reject(err)
    }

    // 429: Rate limit
    if (err.response?.status === 429) {
      toast.error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.')
      return Promise.reject(err)
    }

    toast.error(message)
    return Promise.reject(err)
  }
)

export default api
