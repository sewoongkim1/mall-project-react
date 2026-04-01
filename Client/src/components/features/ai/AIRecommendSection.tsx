import { useAiRecommendations } from '@/hooks/useProducts'
import { ProductCard } from '../product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/index'

export function AIRecommendSection() {
  const { data, isLoading, isError } = useAiRecommendations()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (isError || !data?.length) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        추천 상품을 불러오는 중입니다...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((item) => (
        <ProductCard
          key={item.productId}
          product={item.product}
          recommendReason={item.reason}
        />
      ))}
    </div>
  )
}
