import { useQuery } from '@tanstack/react-query'
import { productApi, type ProductFilters } from '@/api/product.api'
import { aiApi } from '@/api/ai.api'
import { useIsLoggedIn } from '@/store/authStore'

// 상품 목록
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getList(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 3,
  })
}

// 상품 상세
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn:  () => productApi.getOne(id).then((r) => r.data.data),
    enabled:  !!id,
  })
}

// 인기 상품
export function usePopularProducts(limit = 8) {
  return useProducts({ sort: 'popular', limit })
}

// 신상품
export function useNewArrivals(limit = 8) {
  return useProducts({ sort: 'latest', limit })
}

// AI 개인화 추천
export function useAiRecommendations() {
  const isLoggedIn = useIsLoggedIn()

  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn:  () => aiApi.getRecommendations().then((r) => r.data.data),
    enabled:  isLoggedIn,
    staleTime: 1000 * 60 * 60, // 1시간 (서버 캐시와 일치)
    retry: false,
  })
}
