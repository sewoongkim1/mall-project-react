import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/index'
import { ArrowLeft, Truck, Package } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:            { label: '주문 접수',  color: 'bg-yellow-100 text-yellow-700' },
  PAYMENT_CONFIRMED:  { label: '결제 완료',  color: 'bg-blue-100 text-blue-700' },
  PREPARING:          { label: '배송 준비',  color: 'bg-indigo-100 text-indigo-700' },
  SHIPPED:            { label: '배송 중',    color: 'bg-purple-100 text-purple-700' },
  DELIVERED:          { label: '배송 완료',  color: 'bg-green-100 text-green-700' },
  CONFIRMED:          { label: '구매 확정',  color: 'bg-green-100 text-green-700' },
  CANCELLED:          { label: '취소',       color: 'bg-gray-100 text-gray-600' },
}

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [shippingModal, setShippingModal] = useState<string | null>(null)
  const [carrier, setCarrier] = useState('')
  const [trackingNum, setTrackingNum] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', page, filter],
    queryFn: () => api.get(`/seller/orders?page=${page}${filter ? `&status=${filter}` : ''}`).then(r => r.data.data),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status, trackingCarrier, trackingNumber }: any) =>
      api.put(`/seller/orders/${id}`, { status, trackingCarrier, trackingNumber }),
    onSuccess: () => {
      toast.success('주문 상태가 변경되었습니다')
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
      setShippingModal(null)
      setCarrier('')
      setTrackingNum('')
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Package className="w-5 h-5 text-gray-600" />
        <h1 className="text-2xl font-bold">주문 관리</h1>
        <span className="text-sm text-gray-400">{data?.total ?? 0}건</span>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { value: '',                   label: '전체' },
          { value: 'PAYMENT_CONFIRMED',  label: '결제 완료' },
          { value: 'PREPARING',          label: '배송 준비' },
          { value: 'SHIPPED',            label: '배송 중' },
          { value: 'DELIVERED',          label: '배송 완료' },
        ].map(f => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors
              ${filter === f.value ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {!data?.items?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">해당하는 주문이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((order: any) => {
            const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-5">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-400">{order.orderNumber}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                </div>

                {/* 구매자 */}
                <p className="text-xs text-gray-500 mb-2">
                  구매자: {order.buyer?.nickname} ({order.buyer?.email})
                </p>

                {/* 상품 */}
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex gap-3 items-center py-2 border-t border-gray-50 first:border-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.variant?.size}/{item.variant?.color} x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0">{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}

                {/* 배송지 */}
                <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                  배송: {order.shippingAddress?.name} | {order.shippingAddress?.phone} | {order.shippingAddress?.address} {order.shippingAddress?.detailAddress}
                </div>

                {/* 총액 + 액션 */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold">{order.totalAmount?.toLocaleString()}원</span>
                  <div className="flex gap-2">
                    {order.status === 'PAYMENT_CONFIRMED' && (
                      <Button size="sm" onClick={() => updateStatus({ id: order._id, status: 'PREPARING' })}>
                        배송 준비
                      </Button>
                    )}
                    {order.status === 'PREPARING' && (
                      <Button size="sm" onClick={() => setShippingModal(order._id)}>
                        <Truck className="w-3 h-3 mr-1" /> 발송 처리
                      </Button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus({ id: order._id, status: 'DELIVERED' })}>
                        배송 완료
                      </Button>
                    )}
                  </div>
                </div>

                {/* 운송장 입력 모달 (인라인) */}
                {shippingModal === order._id && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
                    <p className="text-sm font-medium">운송장 정보 입력</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="택배사 (예: CJ대한통운)" value={carrier} onChange={e => setCarrier(e.target.value)} />
                      <Input placeholder="운송장 번호" value={trackingNum} onChange={e => setTrackingNum(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={!carrier || !trackingNum}
                        onClick={() => updateStatus({ id: order._id, status: 'SHIPPED', trackingCarrier: carrier, trackingNumber: trackingNum })}>
                        발송 확인
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShippingModal(null)}>취소</Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
