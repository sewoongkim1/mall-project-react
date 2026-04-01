import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

// 현재 유저 조회
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.getMe()
      setUser(res.data.data)
      return res.data.data
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // 10분
  })
}

// 로그인
export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setUser(res.data.data.user)
      toast.success('로그인되었습니다')
      const params = new URLSearchParams(window.location.search)
      navigate(params.get('redirectTo') ?? '/')
    },
  })
}

// 회원가입
export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      setUser(res.data.data.user)
      toast.success('회원가입이 완료되었습니다')
      navigate('/onboarding') // 취향 설문 페이지
    },
  })
}

// 로그아웃
export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      queryClient.clear()
      navigate('/login')
      toast.success('로그아웃되었습니다')
    },
  })
}

// 취향 설정 업데이트
export function useUpdatePreferences() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: authApi.updatePreferences,
    onSuccess: (res) => {
      setUser(res.data.data)
      toast.success('취향 설정이 저장되었습니다')
    },
  })
}
