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
      <div className="text-center py-10 bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl">
        <p className="text-2xl mb-2">✨</p>
        <p className="text-sm text-gray-500">상품을 둘러보시면 AI가 취향을 분석해 추천해드려요!</p>
        <p className="text-xs text-gray-400 mt-1">클릭, 찜, 구매 데이터를 기반으로 추천합니다</p>
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
