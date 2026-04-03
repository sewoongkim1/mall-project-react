import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import toast from 'react-hot-toast'
import { PageSpinner } from '@/components/ui/index'

export default function SocialCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      toast.error('소셜 로그인에 실패했습니다')
      navigate('/login', { replace: true })
      return
    }

    // 토큰 저장 후 유저 정보 조회
    setToken(token)
    authApi.getMe().then((res) => {
      const user = res.data.data
      setUser(user)
      toast.success(`${user.nickname}님 환영합니다!`, { id: 'login-welcome', duration: 10000 })
      navigate('/', { replace: true })
    }).catch(() => {
      toast.error('유저 정보를 불러올 수 없습니다')
      navigate('/login', { replace: true })
    })
  }, [params, navigate, setUser])

  return <PageSpinner />
}
