import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatPrice = (price: number) =>
  price.toLocaleString('ko-KR') + '원'

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })

export const generateOrderNumber = () => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const r = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD-${d}-${r}`
}
