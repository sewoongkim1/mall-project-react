import api from './axios'
import type { AiRecommendationItem } from '@/types'

export const aiApi = {
  getRecommendations: () =>
    api.get<{ success: boolean; data: AiRecommendationItem[]; cached: boolean }>(
      '/ai/recommendations'
    ),

  logBehavior: (data: {
    productId?: string
    eventType: 'VIEW' | 'CLICK' | 'WISHLIST' | 'CART_ADD' | 'PURCHASE' | 'SEARCH'
    metadata?: Record<string, unknown>
  }) => api.post('/ai/behavior', data),
}
