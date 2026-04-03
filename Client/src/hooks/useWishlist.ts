import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { useIsLoggedIn } from '@/store/authStore'

export function useWishlistToggle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => api.post(`/wishlist/${productId}`),
    onSuccess: (res) => {
      const { wishlisted } = res.data.data
      toast.success(wishlisted ? '찜 목록에 추가했습니다' : '찜 목록에서 제거했습니다', { id: 'wishlist' })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function useWishlistCheck(productIds: string[]) {
  const isLoggedIn = useIsLoggedIn()

  return useQuery({
    queryKey: ['wishlist', 'check', productIds.join(',')],
    queryFn: () => api.get('/wishlist/check', { params: { productIds: productIds.join(',') } }).then(r => r.data.data as Record<string, boolean>),
    enabled: isLoggedIn && productIds.length > 0,
    staleTime: 1000 * 60,
  })
}

export function useWishlistList(page = 1) {
  return useQuery({
    queryKey: ['wishlist', 'list', page],
    queryFn: () => api.get(`/wishlist?page=${page}`).then(r => r.data.data),
  })
}
