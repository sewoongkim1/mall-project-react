import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/api/order.api'
import { PageSpinner } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOne(orderId!).then(r => r.data.data),
    enabled: !!orderId,
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">주문이 완료되었습니다!</h1>
      <p className="text-gray-500 mb-6">주문번호: {order?.orderNumber ?? orderId}</p>

      {order && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left mb-6">
          <h2 className="font-bold mb-3">주문 요약</h2>
          <div className="space-y-2 text-sm">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-600">{item.productName} ({item.variant?.size}/{item.variant?.color}) x{item.quantity}</span>
                <span className="font-medium">{item.totalPrice?.toLocaleString()}원</span>
              </div>
            ))}
            <hr className="border-gray-100" />
            <div className="flex justify-between">
              <span className="text-gray-500">배송비</span>
              <span>{order.shippingFee === 0 ? '무료' : `${order.shippingFee?.toLocaleString()}원`}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>총 결제금액</span>
              <span className="text-brand-600">{order.totalAmount?.toLocaleString()}원</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
            <p className="text-gray-500">배송지</p>
            <p className="font-medium">{order.shippingAddress?.name} ({order.shippingAddress?.phone})</p>
            <p className="text-gray-600">{order.shippingAddress?.address} {order.shippingAddress?.detailAddress}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link to="/mypage/orders">
          <Button variant="outline">주문 내역 보기</Button>
        </Link>
        <Link to="/products">
          <Button>쇼핑 계속하기</Button>
        </Link>
      </div>
    </div>
  )
}
