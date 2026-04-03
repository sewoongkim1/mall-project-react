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
  seller?: string
}

export const productApi = {
  getList: (filters: ProductFilters = {}) =>
    api.get<{ success: boolean; data: PaginatedResponse<Product> }>('/products', {
      params: filters,
    }),

  getOne: (id: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`),

  create: (data: any) =>
    api.post<{ success: boolean; data: Product }>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    api.put<{ success: boolean; data: Product }>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),
}

export const uploadApi = {
  images: (files: File[]) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('images', f))
    return api.post<{ success: boolean; data: { url: string; publicId: string }[] }>(
      '/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },
}
