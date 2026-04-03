import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/axios'
import { useProduct } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { useWishlistToggle, useWishlistCheck } from '@/hooks/useWishlist'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/index'
import { formatPrice, cn } from '@/utils'
import { CATEGORY_LABELS } from '@/types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id!)
  const addItem = useCartStore((s) => s.addItem)
  const navigate = useNavigate()
  const { mutate: toggleWishlist } = useWishlistToggle()
  const { data: wishlistMap } = useWishlistCheck(id ? [id] : [])
  const isWishlisted = id ? wishlistMap?.[id] ?? false : false

  const [mainImg,  setMainImg]  = useState(0)
  const [selColor, setSelColor] = useState('')
  const [selSize,  setSelSize]  = useState('')
  const [qty,      setQty]      = useState(1)
  const [activeTab, setTab]     = useState<'desc' | 'review' | 'qna' | 'delivery'>('desc')

  if (isLoading) return <PageSpinner />
  if (!product)  return <div className="text-center py-20 text-gray-400">상품을 찾을 수 없습니다</div>

  const images     = product.images.sort((a, b) => a.sortOrder - b.sortOrder)
  const colors     = [...new Set(product.variants.map((v) => v.color))]
  const sizes      = [...new Set(product.variants.filter((v) => !selColor || v.color === selColor).map((v) => v.size))]
  const selVariant = product.variants.find((v) => v.color === selColor && v.size === selSize)
  const inStock    = selVariant ? selVariant.stockQty > 0 : true

  function handleAddToCart() {
    if (!selColor || !selSize || !product) return
    addItem({
      variantId:    selVariant?.sku ?? `${product._id}-${selColor}-${selSize}`,
      productId:    product._id,
      productName:  product.name,
      productImage: images[0]?.url ?? '',
      size:         selSize,
      color:        selColor,
      price:        product.price,
      quantity:     qty,
      sellerName:   product.seller.brandName,
      sellerId:     product.seller._id,
    })
  }

  const TABS = [
    { key: 'desc',     label: '상품 설명'      },
    { key: 'review',   label: `리뷰 (${product.reviewCount})` },
    { key: 'qna',      label: 'Q&A'            },
    { key: 'delivery', label: '배송/반품'       },
  ] as const

  return (
    <div>
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">홈</Link>
        <span>›</span>
        <Link to="/products" className="hover:text-gray-600">상품</Link>
        <span>›</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-gray-600">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>›</span>
        <span className="text-gray-700 truncate max-w-[120px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">

        {/* 이미지 갤러리 */}
        <div>
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
            {images[mainImg] && (
              <img src={images[mainImg].url} alt={product.name}
                className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button key={i} onClick={() => setMainImg(i)}
                className={cn(
                  'w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors',
                  mainImg === i ? 'border-brand-600' : 'border-transparent'
                )}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <Link to={`/seller/${product.seller._id}`}
              className="text-sm text-brand-600 font-medium hover:underline">
              {product.seller.brandName}
            </Link>
            <button onClick={() => id && toggleWishlist(id)}
              className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* 평점 */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('w-4 h-4',
                    i < Math.round(product.avgRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  )} />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.avgRating.toFixed(1)} ({product.reviewCount}개 리뷰)
              </span>
            </div>
          )}

          <p className="text-2xl font-bold mb-6">{formatPrice(product.price)}</p>

          {/* 색상 선택 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              색상 {selColor && <span className="text-brand-600 font-normal ml-1">{selColor}</span>}
            </p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button key={c} onClick={() => { setSelColor(c); setSelSize('') }}
                  className={cn(
                    'px-3 py-1.5 text-sm border rounded-xl transition-colors',
                    selColor === c
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 사이즈 선택 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">사이즈</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s) => {
                const v       = product.variants.find((vv) => vv.size === s && (!selColor || vv.color === selColor))
                const soldOut = !v || v.stockQty === 0
                return (
                  <button key={s} onClick={() => !soldOut && setSelSize(s)}
                    disabled={soldOut}
                    className={cn(
                      'w-12 h-12 text-sm border rounded-xl transition-colors',
                      selSize === s
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : soldOut
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 수량 */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">수량</p>
            <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 text-lg">−</button>
              <span className="px-5 py-2 text-sm font-medium min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 text-lg">+</button>
            </div>
          </div>

          {/* 총 금액 */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-4">
            <span className="text-sm text-gray-500">총 상품금액</span>
            <span className="text-xl font-bold text-brand-700">
              {formatPrice(product.price * qty)}
            </span>
          </div>

          {/* 버튼 */}
          {!selColor || !selSize ? (
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl mb-4 text-center">
              색상과 사이즈를 선택해주세요
            </p>
          ) : null}
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1"
              disabled={!selColor || !selSize || !inStock}
              onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4" />
              장바구니
            </Button>
            <Button size="lg" className="flex-2"
              disabled={!selColor || !selSize || !inStock}
              onClick={() => {
                if (!selColor || !selSize || !product) return
                addItem({
                  variantId:    selVariant?.sku ?? `${product._id}-${selColor}-${selSize}`,
                  productId:    product._id,
                  productName:  product.name,
                  productImage: images[0]?.url ?? '',
                  size:         selSize,
                  color:        selColor,
                  price:        product.price,
                  quantity:     qty,
                  sellerName:   product.seller.brandName,
                  sellerId:     product.seller._id,
                })
                navigate('/checkout')
              }}>
              {inStock ? '바로 구매' : '품절'}
            </Button>
          </div>

          {/* 스타일 태그 */}
          {product.styleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {product.styleTags.map((tag) => (
                <span key={tag}
                  className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-100 mb-8">
        <div className="flex">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                'px-5 py-3 text-sm transition-colors border-b-2',
                activeTab === t.key
                  ? 'border-brand-600 text-brand-700 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'desc' && (
        <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {product.description}
        </div>
      )}

      {activeTab === 'review' && (
        <ReviewSection productId={product._id} />
      )}
    </div>
  )
}

// ── 리뷰 섹션 ────────────────────────────────────────
function ReviewSection({ productId }: { productId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/${productId}`).then(r => r.data.data),
  })

  if (isLoading) return <div className="text-center py-8 text-gray-400">로딩 중...</div>

  return (
    <div>
      {!data?.items?.length ? (
        <div className="text-center py-12 text-gray-400">아직 리뷰가 없습니다</div>
      ) : (
        <div className="space-y-4">
          {data.items.map((rev: any) => (
            <div key={rev._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-3.5 h-3.5 ${n <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{rev.user?.nickname}</span>
                <span className="text-xs text-gray-300">{new Date(rev.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <p className="text-sm text-gray-700">{rev.content}</p>
              {rev.imageUrls?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {rev.imageUrls.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
