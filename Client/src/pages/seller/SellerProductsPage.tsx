import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productApi } from '@/api/product.api'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/index'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import type { Product } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: '판매중',  color: 'bg-green-100 text-green-700' },
  HIDDEN:   { label: '숨김',    color: 'bg-gray-100 text-gray-600' },
  SOLD_OUT: { label: '품절',    color: 'bg-red-100 text-red-700' },
}

export default function SellerProductsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products', page],
    queryFn: () => productApi.getList({ seller: 'me' as any, page, limit: 10 }).then(r => r.data.data),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      toast.success('상품이 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/seller" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">상품 관리</h1>
          <span className="text-sm text-gray-400">{data?.total ?? 0}개</span>
        </div>
        <Link to="/seller/products/new">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> 상품 등록</Button>
        </Link>
      </div>

      {!data?.items?.length ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 mb-4">등록된 상품이 없습니다</p>
          <Link to="/seller/products/new">
            <Button>첫 상품 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((product: Product) => {
            const mainImage = product.images?.find(i => i.isMain) ?? product.images?.[0]
            const status = STATUS_MAP[product.status] ?? STATUS_MAP.ACTIVE
            const totalStock = product.variants?.reduce((sum, v) => sum + v.stockQty, 0) ?? 0

            return (
              <div key={product._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                {/* 이미지 */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {mainImage ? (
                    <img src={mainImage.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{product.price.toLocaleString()}원</span>
                    <span>재고 {totalStock}개</span>
                    <span>조회 {product.viewCount}</span>
                  </div>
                </div>

                {/* 액션 */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/seller/products/${product._id}/edit`}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button onClick={() => { if (confirm('정말 삭제하시겠습니까?')) remove(product._id) }}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* 페이지네이션 */}
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
