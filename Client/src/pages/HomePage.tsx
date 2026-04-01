import { Link } from 'react-router-dom'
import { usePopularProducts, useNewArrivals } from '@/hooks/useProducts'
import { useIsLoggedIn } from '@/store/authStore'
import { AIRecommendSection } from '@/components/features/ai/AIRecommendSection'
import { ProductCard } from '@/components/features/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/index'
import { CATEGORY_LABELS, type ProductCategory } from '@/types'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  TOP: '👕', BOTTOM: '👖', OUTER: '🧥', DRESS: '👗',
  SHOES: '👟', BAG: '👜', ACCESSORY: '💍', HAT: '🧢',
}

function ProductGrid({ isLoading, products }: { isLoading: boolean; products: any[] }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  )
}

export default function HomePage() {
  const isLoggedIn = useIsLoggedIn()
  const { data: popularData, isLoading: popularLoading } = usePopularProducts(8)
  const { data: newData,     isLoading: newLoading }     = useNewArrivals(8)

  return (
    <div className="space-y-12">

      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700
                          min-h-[240px] flex items-center justify-center px-8 text-center">
        <div className="text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            AI가 고른 나만의 스타일
          </h1>
          <p className="text-brand-100 mb-6">취향을 분석해 딱 맞는 옷을 추천해드립니다</p>
          <Link to={isLoggedIn ? '#ai-recommend' : '/register'}
            className="inline-block px-6 py-3 bg-white text-brand-700 font-semibold
                       rounded-full hover:bg-brand-50 transition-colors">
            {isLoggedIn ? 'AI 추천 받기' : '무료로 시작하기'}
          </Link>
        </div>
      </section>

      {/* AI 추천 */}
      {isLoggedIn && (
        <section id="ai-recommend">
          <div className="flex items-center gap-2 mb-5">
            <span className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
              AI 추천
            </span>
            <h2 className="text-lg font-bold">나를 위한 추천</h2>
          </div>
          <AIRecommendSection />
        </section>
      )}

      {/* 카테고리 퀵 네비 */}
      <section>
        <h2 className="text-lg font-bold mb-4">카테고리</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map(([cat, label]) => (
            <Link key={cat} to={`/products?category=${cat}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100
                              flex items-center justify-center text-2xl
                              group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
                {CATEGORY_ICONS[cat]}
              </div>
              <span className="text-xs text-gray-600 group-hover:text-brand-600">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 인기 급상승 */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
              인기
            </span>
            <h2 className="text-lg font-bold">인기 급상승</h2>
          </div>
          <Link to="/products?sort=popular" className="text-sm text-gray-400 hover:text-brand-600">
            더보기 →
          </Link>
        </div>
        <ProductGrid isLoading={popularLoading} products={popularData?.items ?? []} />
      </section>

      {/* 신상품 */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
              NEW
            </span>
            <h2 className="text-lg font-bold">신상품</h2>
          </div>
          <Link to="/products?sort=latest" className="text-sm text-gray-400 hover:text-brand-600">
            더보기 →
          </Link>
        </div>
        <ProductGrid isLoading={newLoading} products={newData?.items ?? []} />
      </section>
    </div>
  )
}
