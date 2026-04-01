import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { formatPrice, cn } from '@/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product:         Product
  recommendReason?: string
  className?:      string
}

export function ProductCard({ product, recommendReason, className }: ProductCardProps) {
  const image = product.images.find((i) => i.isMain)?.url ?? product.images[0]?.url ?? ''

  return (
    <div className={cn('group cursor-pointer', className)}>
      <Link to={`/products/${product._id}`}>
        {/* 이미지 */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
          {image ? (
            <img src={image} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              이미지 없음
            </div>
          )}

          {/* 찜 버튼 */}
          <button
            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
            onClick={(e) => {
              e.preventDefault()
              // TODO: 찜 토글
            }}
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>

          {/* 품절 뱃지 */}
          {product.status === 'SOLD_OUT' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
              <span className="text-white text-sm font-medium">품절</span>
            </div>
          )}

          {/* AI 추천 이유 */}
          {recommendReason && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-900/80
                            to-transparent px-3 py-3 rounded-b-2xl">
              <p className="text-white text-xs line-clamp-2">{recommendReason}</p>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">{product.seller?.brandName}</p>
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </p>
          <div className="flex items-center justify-between pt-0.5">
            <p className="text-sm font-bold">{formatPrice(product.price)}</p>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-gray-400">
                <span className="text-amber-400">★</span>
                <span>{product.avgRating.toFixed(1)}</span>
                <span>({product.reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
