import { Link } from 'react-router-dom'
import { useMe, useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/index'
import { User, ShoppingBag, Heart, Settings, Store, ChevronRight } from 'lucide-react'

const MENU_ITEMS = [
  { to: '/mypage/orders',   icon: ShoppingBag, label: '주문 내역',   desc: '주문/배송 조회' },
  { to: '/mypage/wishlist', icon: Heart,        label: '찜 목록',     desc: '관심 상품 모아보기' },
  { to: '/seller/apply',    icon: Store,        label: '셀러 신청',   desc: '판매자로 등록하기' },
  { to: '/mypage/settings', icon: Settings,     label: '계정 설정',   desc: '프로필, 비밀번호 변경' },
]

export default function MyPage() {
  const { data: user, isLoading } = useMe()
  const { mutate: logout, isPending } = useLogout()

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-brand-600" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{user?.nickname}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
              {user?.role === 'SELLER' ? '셀러' : user?.role === 'ADMIN' ? '관리자' : '일반 회원'}
            </span>
          </div>
        </div>

        {/* AI 취향 태그 */}
        {user?.preferences?.styles && user.preferences.styles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">AI 취향 키워드</p>
            <div className="flex flex-wrap gap-1.5">
              {user.preferences.styles.map((style) => (
                <span key={style} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 메뉴 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
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

      {/* 로그아웃 */}
      <Button variant="outline" className="w-full" onClick={() => logout()} loading={isPending}>
        로그아웃
      </Button>
    </div>
  )
}
