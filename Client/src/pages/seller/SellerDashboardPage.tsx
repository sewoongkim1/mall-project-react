import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/axios'
import { PageSpinner } from '@/components/ui/index'
import { Package, Settings, ShoppingBag, BarChart3, ChevronRight } from 'lucide-react'

const MENU_ITEMS = [
  { to: '/seller/products', icon: Package,     label: '상품 관리',   desc: '상품 등록/수정/삭제' },
  { to: '/seller/orders',   icon: ShoppingBag, label: '주문 관리',   desc: '주문 접수/배송 처리' },
  { to: '/seller/stats',    icon: BarChart3,   label: '매출 통계',   desc: '매출/정산 조회' },
  { to: '/seller/settings', icon: Settings,    label: '스토어 설정', desc: '브랜드 정보, 정산 계좌 수정' },
]

export default function SellerDashboardPage() {
  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller-status'],
    queryFn: () => api.get('/seller/my-status').then(r => r.data.data),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto">
      {/* 스토어 정보 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{seller?.brandName ?? '셀러 대시보드'}</h1>
            <p className="text-sm text-gray-500">{seller?.storeBio ?? '스토어 소개가 없습니다'}</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            {seller?.status === 'APPROVED' ? '운영 중' : seller?.status}
          </span>
        </div>

        {/* 간단 통계 (추후 실제 데이터 연동) */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">0</p>
            <p className="text-xs text-gray-400 mt-1">등록 상품</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">0</p>
            <p className="text-xs text-gray-400 mt-1">신규 주문</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">0원</p>
            <p className="text-xs text-gray-400 mt-1">이번 달 매출</p>
          </div>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {MENU_ITEMS.map(({ to, icon: Icon, label, desc }, i) => (
          <Link key={to} to={to}
            className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors
              ${i < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <Icon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}
