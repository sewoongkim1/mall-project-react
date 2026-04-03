import api from './axios'

export const orderApi = {
  create: (data: any) =>
    api.post('/orders', data),

  getList: (page = 1) =>
    api.get(`/orders?page=${page}`),

  getOne: (id: string) =>
    api.get(`/orders/${id}`),

  confirmPayment: (id: string, data?: { paymentMethod?: string; pgTransactionId?: string }) =>
    api.put(`/orders/${id}/confirm`, data ?? {}),
}
