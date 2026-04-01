import api from './axios'
import type { User, Preferences } from '@/types'

export const authApi = {
  register: (data: { email: string; password: string; nickname: string }) =>
    api.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get<{ success: boolean; data: User }>('/auth/me'),

  updatePreferences: (data: Preferences) =>
    api.put<{ success: boolean; data: User }>('/auth/preferences', data),
}
