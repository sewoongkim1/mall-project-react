import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { aiApi } from '@/api/ai.api'
import { useIsLoggedIn, useIsAdmin, useIsSeller } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { CATEGORY_LABELS, type ProductCategory } from '@/types'
const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

export function GNB() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery]       = useState('')
  const totalCount = useCartStore((s) => s.totalCount())
  const isLoggedIn = useIsLoggedIn()
  const isAdmin = useIsAdmin()
  const isSeller = useIsSeller()
  const { mutate: logout } = useLogout()
  const navigate   = useNavigate()
  const inputRef   = useRef<HTMLInputElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      aiApi.logBehavior({ eventType: 'SEARCH', metadata: { query: query.trim() } }).catch(() => {})
      navigate(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">

        {/* 상단 바 */}
        <div className="flex items-center gap-4 h-16">
          {/* 로고 */}
          <Link to="/" className="text-xl font-bold text-brand-600 flex-shrink-0">
            StyleAI
          </Link>

          {/* 검색창 (데스크톱) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="상품명, 브랜드, 스타일 검색..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm
                           focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1">
            {/* 모바일 검색 아이콘 */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => { setMenuOpen(true); setTimeout(() => inputRef.current?.focus(), 100) }}>
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* 찜 */}
            <Link to="/mypage/wishlist" className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-5 h-5 text-gray-600" />
            </Link>

            {/* 장바구니 */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white
                                 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount > 9 ? '9+' : totalCount}
                </span>
              )}
            </Link>

            {/* 유저 메뉴 */}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100
                                rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100
                                group-hover:visible transition-all">
                  <Link to="/mypage" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">
                    마이페이지
                  </Link>
                  <Link to="/mypage/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    주문 내역
                  </Link>
                  {isSeller && (
                    <Link to="/seller" className="block px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50">
                      셀러 관리
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50">
                      Admin
                    </Link>
                  )}
                  <hr className="border-gray-100" />
                  <button onClick={() => logout()}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-b-xl">
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login"
                className="ml-1 px-4 py-2 text-sm font-medium text-white bg-brand-600
                           rounded-full hover:bg-brand-700 transition-colors">
                로그인
              </Link>
            )}

            {/* 모바일 햄버거 */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full ml-1"
              onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 카테고리 탭 (데스크톱) */}
        <nav className="hidden md:flex gap-1 overflow-x-auto scrollbar-hide">
          <Link to="/products"
            className="flex-shrink-0 px-4 py-2.5 text-sm text-gray-600 hover:text-brand-600
                       border-b-2 border-transparent hover:border-brand-600 transition-colors">
            전체
          </Link>
          {CATEGORIES.map(([cat, label]) => (
            <Link key={cat} to={`/products?category=${cat}`}
              className="flex-shrink-0 px-4 py-2.5 text-sm text-gray-600 hover:text-brand-600
                         border-b-2 border-transparent hover:border-brand-600 transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* 모바일 메뉴 드로어 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="검색..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none" />
            </div>
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">전체</Link>
          {CATEGORIES.map(([cat, label]) => (
            <Link key={cat} to={`/products?category=${cat}`} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
