import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils'

const SHIPPING = 3000

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice } = useCartStore()
  const total    = totalPrice()
  const shipping = total > 0 ? SHIPPING : 0
  const finalAmt = total + shipping

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <p className="text-lg font-medium text-gray-500 mb-2">장바구니가 비어있어요</p>
        <p className="text-sm text-gray-400 mb-6">마음에 드는 상품을 담아보세요</p>
        <Link to="/products">
          <Button>쇼핑하러 가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">장바구니 <span className="text-brand-600">{items.length}</span></h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* 상품 목록 */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.variantId}
              className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
              <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                <img src={item.productImage} alt={item.productName}
                  className="w-20 h-20 object-cover rounded-xl bg-gray-100" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{item.sellerName}</p>
                <Link to={`/products/${item.productId}`}>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {item.productName}
                  </p>
                </Link>
                <p className="text-xs text-gray-500 mb-2">
                  {item.size} / {item.color}
                </p>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.variantId, item.quantity - 1)}
                      className="px-3 py-1 text-gray-500 hover:bg-gray-50">−</button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.variantId, item.quantity + 1)}
                      className="px-3 py-1 text-gray-500 hover:bg-gray-50">+</button>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
              <button onClick={() => removeItem(item.variantId)}
                className="p-1.5 text-gray-300 hover:text-red-400 self-start transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 주문 요약 */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold mb-4">주문 요약</h2>
            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span>{formatPrice(shipping)}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 mb-5">
              <div className="flex justify-between font-bold">
                <span>총 결제금액</span>
                <span className="text-brand-700 text-lg">{formatPrice(finalAmt)}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                주문하기 ({items.length}개 상품)
              </Button>
            </Link>
            <Link to="/products"
              className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3">
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
