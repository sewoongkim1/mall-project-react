import api from './axios'
import type { Product, PaginatedResponse } from '@/types'

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string
  sort?: 'latest' | 'popular' | 'priceLow' | 'priceHigh' | 'rating'
  q?: string
  page?: number
  limit?: number
}

export const productApi = {
  getList: (filters: ProductFilters = {}) =>
    api.get<{ success: boolean; data: PaginatedResponse<Product> }>('/products', {
      params: filters,
    }),

  getOne: (id: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`),

  create: (data: FormData) =>
    api.post<{ success: boolean; data: Product }>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: Partial<Product>) =>
    api.put<{ success: boolean; data: Product }>(`/products/${id}`, data),
}
