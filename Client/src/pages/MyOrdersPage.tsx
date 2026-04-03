import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/api/order.api'
import { PageSpinner } from '@/components/ui/index'
import { ArrowLeft, Package, ChevronRight } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:            { label: '주문 접수',  color: 'bg-yellow-100 text-yellow-700' },
  PAYMENT_CONFIRMED:  { label: '결제 완료',  color: 'bg-blue-100 text-blue-700' },
  PREPARING:          { label: '배송 준비',  color: 'bg-indigo-100 text-indigo-700' },
  SHIPPED:            { label: '배송 중',    color: 'bg-purple-100 text-purple-700' },
  DELIVERED:          { label: '배송 완료',  color: 'bg-green-100 text-green-700' },
  CONFIRMED:          { label: '구매 확정',  color: 'bg-green-100 text-green-700' },
  CANCELLED:          { label: '취소',       color: 'bg-gray-100 text-gray-600' },
  REFUNDED:           { label: '환불 완료',  color: 'bg-red-100 text-red-700' },
}

export default function MyOrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => orderApi.getList(page).then(r => r.data.data),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mypage" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Package className="w-5 h-5 text-gray-600" />
        <h1 className="text-2xl font-bold">주문 내역</h1>
      </div>

      {!data?.items?.length ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">주문 내역이 없습니다</p>
          <Link to="/products" className="text-brand-600 text-sm hover:underline">쇼핑하러 가기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((order: any) => {
            const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
            const firstItem = order.items?.[0]
            const itemCount = order.items?.length ?? 0

            return (
              <Link key={order._id} to={`/mypage/orders/${order._id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-400">{order.orderNumber}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                </div>

                {/* 상품 정보 */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {firstItem?.image && <img src={firstItem.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {firstItem?.name}{itemCount > 1 ? ` 외 ${itemCount - 1}건` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {firstItem?.variant?.size} / {firstItem?.variant?.color}
                      {firstItem?.quantity > 1 ? ` x${firstItem.quantity}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-sm">{order.totalAmount?.toLocaleString()}원</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            )
          })}

          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
