import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user:      User | null
  isLoading: boolean
  setUser:   (user: User | null) => void
  setLoading:(loading: boolean) => void
  logout:    () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:      null,
      isLoading: false,
      setUser:   (user)    => set({ user }),
      setLoading:(loading) => set({ isLoading: loading }),
      logout:    ()        => set({ user: null }),
    }),
    {
      name:    'styleai-auth',
      partialize: (state) => ({ user: state.user }),  // user만 localStorage에 저장
    }
  )
)

// 편의 셀렉터
export const useUser = () => useAuthStore((s) => s.user)
export const useIsLoggedIn = () => useAuthStore((s) => !!s.user)
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN')
export const useIsSeller = () =>
  useAuthStore((s) => s.user?.role === 'SELLER' || s.user?.role === 'ADMIN')
