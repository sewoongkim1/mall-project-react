import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/api/order.api'
import { PageSpinner } from '@/components/ui/index'
import { ArrowLeft } from 'lucide-react'

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

const ITEM_STATUS: Record<string, string> = {
  PENDING: '접수', CONFIRMED: '확인', PREPARING: '준비 중',
  SHIPPED: '배송 중', DELIVERED: '배송 완료', CONFIRMED_PURCHASE: '구매 확정',
  CANCELLED: '취소', REFUNDED: '환불',
}

export default function MyOrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOne(id!).then(r => r.data.data),
    enabled: !!id,
  })

  if (isLoading) return <PageSpinner />
  if (!order) return <div className="text-center py-20 text-gray-400">주문을 찾을 수 없습니다</div>

  const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mypage/orders" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold">주문 상세</h1>
      </div>

      {/* 주문 상태 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{order.orderNumber}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
        </div>
        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ko-KR')}</p>
      </div>

      {/* 주문 상품 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="font-bold mb-4">주문 상품</h2>
        <div className="space-y-4">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.product}`} className="text-sm font-medium hover:text-brand-600">
                  {item.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.variant?.size} / {item.variant?.color} | {item.quantity}개
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()}원</span>
                  <span className="text-xs text-gray-400">{ITEM_STATUS[item.status] ?? item.status}</span>
                </div>
                {item.tracking?.number && (
                  <p className="text-xs text-blue-600 mt-1">
                    운송장: {item.tracking.carrier} {item.tracking.number}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 배송지 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="font-bold mb-3">배송지 정보</h2>
        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">수령인:</span> {order.shippingAddress?.name} ({order.shippingAddress?.phone})</p>
          <p><span className="text-gray-500">주소:</span> [{order.shippingAddress?.zipCode}] {order.shippingAddress?.address} {order.shippingAddress?.detailAddress}</p>
          {order.shippingAddress?.memo && <p><span className="text-gray-500">메모:</span> {order.shippingAddress.memo}</p>}
        </div>
      </div>

      {/* 결제 정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold mb-3">결제 정보</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">상품 금액</span>
            <span>{(order.totalAmount - (order.shippingAmount ?? 0)).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">배송비</span>
            <span>{order.shippingAmount === 0 ? '무료' : `${(order.shippingAmount ?? 3000).toLocaleString()}원`}</span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between font-bold text-base">
            <span>총 결제금액</span>
            <span className="text-brand-600">{order.totalAmount?.toLocaleString()}원</span>
          </div>
          {order.payment?.method && (
            <p className="text-xs text-gray-400 mt-2">
              결제수단: {order.payment.method} | 결제일: {new Date(order.payment.paidAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
