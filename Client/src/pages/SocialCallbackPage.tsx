import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import toast from 'react-hot-toast'
import { PageSpinner } from '@/components/ui/index'

export default function SocialCallbackPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  useEffect(() => {
    // 쿠키에 토큰이 설정된 상태로 리다이렉트됨 → getMe로 유저 정보 조회
    authApi.getMe().then((res) => {
      const user = res.data.data
      setUser(user)
      // accessToken은 쿠키에서 가져옴 → 응답 헤더에 없으므로 getMe 성공 시 쿠키 기반으로 동작
      toast.success(`${user.nickname}님 환영합니다!`, { id: 'login-welcome', duration: 10000 })
      navigate('/', { replace: true })
    }).catch(() => {
      toast.error('소셜 로그인에 실패했습니다. 다시 시도해주세요.')
      navigate('/login', { replace: true })
    })
  }, [navigate, setUser, setToken])

  return <PageSpinner />
}
