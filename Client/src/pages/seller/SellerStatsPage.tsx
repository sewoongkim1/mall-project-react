import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/axios'
import { PageSpinner } from '@/components/ui/index'
import { ArrowLeft, TrendingUp, ShoppingBag, Package, DollarSign } from 'lucide-react'

const ORDER_STATUS: Record<string, string> = {
  PENDING: '접수', PAYMENT_CONFIRMED: '결제완료', PREPARING: '준비',
  SHIPPED: '배송중', DELIVERED: '완료', CONFIRMED: '확정', CANCELLED: '취소',
}

export default function SellerStatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: () => api.get('/seller/stats').then(r => r.data.data),
  })

  const { data: ordersData } = useQuery({
    queryKey: ['seller-orders-all'],
    queryFn: () => api.get('/seller/orders?limit=100').then(r => r.data.data),
  })

  if (isLoading) return <PageSpinner />

  const orders = ordersData?.items ?? []

  // 상태별 주문 수
  const statusCounts: Record<string, number> = {}
  orders.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
  })

  // 최근 7일 매출
  const now = Date.now()
  const dailyRevenue: { date: string; amount: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    const dayOrders = orders.filter((o: any) => {
      const od = new Date(o.createdAt)
      return od.toDateString() === d.toDateString() && o.status !== 'CANCELLED'
    })
    const amount = dayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount ?? 0), 0)
    dailyRevenue.push({ date: dateStr, amount })
  }
  const maxRevenue = Math.max(...dailyRevenue.map(d => d.amount), 1)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <TrendingUp className="w-5 h-5 text-gray-600" />
        <h1 className="text-2xl font-bold">매출 통계</h1>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <p className="text-xl font-bold">{(stats?.totalRevenue ?? 0).toLocaleString()}원</p>
          <p className="text-xs text-gray-400">총 매출</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <ShoppingBag className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold">{stats?.orderCount ?? 0}건</p>
          <p className="text-xs text-gray-400">총 주문</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <Package className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <p className="text-xl font-bold">{stats?.productCount ?? 0}개</p>
          <p className="text-xs text-gray-400">등록 상품</p>
        </div>
      </div>

      {/* 7일 매출 차트 (바 차트) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold mb-4">최근 7일 매출</h2>
        <div className="flex items-end gap-2 h-40">
          {dailyRevenue.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400">{d.amount > 0 ? `${(d.amount / 1000).toFixed(0)}K` : ''}</span>
              <div className="w-full bg-brand-100 rounded-t-md relative" style={{ height: `${Math.max((d.amount / maxRevenue) * 100, 2)}%` }}>
                <div className="absolute inset-0 bg-brand-500 rounded-t-md opacity-80" />
              </div>
              <span className="text-[10px] text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 주문 상태별 현황 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold mb-4">주문 상태별 현황</h2>
        {Object.keys(statusCounts).length === 0 ? (
          <p className="text-sm text-gray-400">주문이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{ORDER_STATUS[status] ?? status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(count / orders.length) * 100}%` }} />
                  </div>
                  <span className="font-medium w-8 text-right">{count}건</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 주문 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold mb-4">최근 주문</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400">주문이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 10).map((o: any) => (
              <div key={o._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-gray-600">{o.orderNumber}</span>
                  <span className="text-gray-400 ml-2">{o.buyer?.nickname ?? ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{(o.totalAmount ?? 0).toLocaleString()}원</span>
                  <span className="text-xs text-gray-400">{ORDER_STATUS[o.status] ?? o.status}</span>
                  <span className="text-xs text-gray-300">{new Date(o.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
