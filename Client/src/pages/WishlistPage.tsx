import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlistList, useWishlistToggle } from '@/hooks/useWishlist'
import { PageSpinner } from '@/components/ui/index'
import { Heart, ArrowLeft } from 'lucide-react'
import type { Product } from '@/types'

export default function WishlistPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useWishlistList(page)
  const { mutate: toggle } = useWishlistToggle()

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mypage" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
        <h1 className="text-2xl font-bold">찜 목록</h1>
        <span className="text-sm text-gray-400">{data?.total ?? 0}개</span>
      </div>

      {!data?.items?.length ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">찜한 상품이 없습니다</p>
          <Link to="/products" className="text-brand-600 text-sm hover:underline">상품 둘러보기</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.items.map((product: Product) => {
              const mainImage = product.images?.find(i => i.isMain) ?? product.images?.[0]
              return (
                <div key={product._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
                  <Link to={`/products/${product._id}`} className="block">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {mainImage ? (
                        <img src={mainImage.url} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400">{product.seller?.brandName}</p>
                      <p className="text-sm font-medium truncate mt-0.5">{product.name}</p>
                      <p className="text-sm font-bold mt-1">{product.price.toLocaleString()}원</p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <button onClick={() => toggle(product._id)}
                      className="w-full py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      찜 해제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
