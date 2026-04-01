import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/features/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/index'
import { CATEGORY_LABELS, type ProductCategory } from '@/types'
import { cn } from '@/utils'

const SIZES   = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
  { value: 'latest',    label: '최신순'     },
  { value: 'popular',   label: '인기순'     },
  { value: 'priceLow',  label: '낮은가격순' },
  { value: 'priceHigh', label: '높은가격순' },
  { value: 'rating',    label: '리뷰 많은순' },
]

export default function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const category = params.get('category') ?? undefined
  const sort     = (params.get('sort') ?? 'latest') as any
  const q        = params.get('q') ?? undefined
  const page     = Number(params.get('page') ?? 1)

  const { data, isLoading } = useProducts({ category, sort, q, page, limit: 20 })

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.set('page', '1')
    setParams(next)
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">
            {category ? CATEGORY_LABELS[category as ProductCategory] : q ? `"${q}" 검색 결과` : '전체 상품'}
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-400 mt-0.5">총 {data?.total ?? 0}개 상품</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setParam('sort', e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-colors',
              filterOpen ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}>
            <SlidersHorizontal className="w-4 h-4" />
            필터
          </button>
        </div>
      </div>

      {/* 활성 필터 태그 */}
      {(category || q) && (
        <div className="flex gap-2 flex-wrap mb-4">
          {category && (
            <span className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs
                             font-medium px-2.5 py-1 rounded-full">
              {CATEGORY_LABELS[category as ProductCategory]}
              <button onClick={() => setParam('category', null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {q && (
            <span className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs
                             font-medium px-2.5 py-1 rounded-full">
              "{q}"
              <button onClick={() => setParam('q', null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* 필터 사이드바 */}
        {filterOpen && (
          <aside className="w-48 flex-shrink-0 hidden md:block">
            <div className="sticky top-24 space-y-6">
              {/* 카테고리 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">카테고리</p>
                <div className="space-y-1">
                  <button onClick={() => setParam('category', null)}
                    className={cn('block w-full text-left px-2 py-1.5 text-sm rounded-lg',
                      !category ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                    전체
                  </button>
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                    <button key={cat} onClick={() => setParam('category', cat)}
                      className={cn('block w-full text-left px-2 py-1.5 text-sm rounded-lg',
                        category === cat ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 사이즈 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">사이즈</p>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((s) => (
                    <button key={s}
                      className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg hover:border-brand-400 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 상품 그리드 */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : !data?.items.length ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">상품이 없습니다</p>
              <p className="text-gray-300 text-sm">다른 조건으로 검색해보세요</p>
            </div>
          ) : (
            <>
              <div className={cn(
                'grid gap-4',
                filterOpen ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
              )}>
                {data.items.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* 페이지네이션 */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setParam('page', String(i + 1))}
                      className={cn(
                        'w-9 h-9 rounded-xl text-sm transition-colors',
                        page === i + 1
                          ? 'bg-brand-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      )}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
