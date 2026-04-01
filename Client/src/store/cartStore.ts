import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import type { CartItem } from '@/types'

interface CartState {
  items:      CartItem[]
  addItem:    (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty:  (variantId: string, quantity: number) => void
  clearCart:  () => void
  totalPrice: () => number
  totalCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId)
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }))
          toast.success('수량이 변경되었습니다')
        } else {
          set((s) => ({ items: [...s.items, item] }))
          toast.success('장바구니에 담았습니다')
        }
      },

      removeItem: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),

      updateQty: (variantId, quantity) => {
        if (quantity < 1) return
        set((s) => ({
          items: s.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'styleai-cart' }
  )
)
