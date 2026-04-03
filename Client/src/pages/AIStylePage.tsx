import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { Sparkles, ArrowLeft, TrendingUp, ShoppingBag, Heart, Search } from 'lucide-react'

const PERSONA_EMOJI: Record<string, string> = {
  '미니멀리스트': '🤍', '트렌드세터': '🔥', '클래식러버': '🎩',
  '스트릿패셔니스타': '🛹', '스포티캐주얼': '🏃', '로맨티시스트': '🌸',
}

export default function AIStylePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-style-analysis'],
    queryFn: () => api.get('/ai/style-analysis').then(r => r.data.data),
    staleTime: 1000 * 60 * 30, // 30분 캐시
    retry: false,
  })

  if (isLoading) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <Sparkles className="w-10 h-10 text-brand-500 mx-auto mb-4 animate-pulse" />
      <p className="text-gray-500">AI가 스타일을 분석하고 있습니다...</p>
    </div>
  )

  if (isError || !data || !data.styleProfile) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-2">스타일 분석을 위한 데이터가 부족합니다</p>
      <p className="text-xs text-gray-400 mb-6">상품을 둘러보고, 찜하고, 구매하면 AI가 취향을 분석해드려요!</p>
      <Link to="/products"><Button>상품 둘러보기</Button></Link>
    </div>
  )

  const emoji = PERSONA_EMOJI[data.fashionPersona] ?? '✨'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mypage" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Sparkles className="w-5 h-5 text-brand-600" />
        <h1 className="text-2xl font-bold">AI 스타일 분석</h1>
      </div>

      {/* 페르소나 카드 */}
      <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="text-4xl mb-3">{emoji}</div>
        <h2 className="text-xl font-bold mb-1">{data.fashionPersona}</h2>
        <p className="text-white/80 text-sm leading-relaxed">{data.styleProfile}</p>
      </div>

      {/* 스타일 키워드 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h3 className="font-bold mb-3">나의 스타일 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {data.topStyles?.map((style: string) => (
            <span key={style} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
              {style}
            </span>
          ))}
        </div>
        {data.preferredCategories?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">선호 카테고리</p>
            <div className="flex gap-2">
              {data.preferredCategories.map((cat: string) => (
                <Link key={cat} to={`/products?category=${cat}`}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-brand-50 hover:text-brand-600">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">선호 가격대: {data.priceRange}</p>
      </div>

      {/* AI 조언 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h3 className="font-bold mb-2">AI 스타일 조언</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{data.recommendations}</p>
      </div>

      {/* 데이터 통계 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-bold mb-3">분석 데이터</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: TrendingUp,  label: '조회', count: data.dataStats?.viewCount ?? 0 },
            { icon: Heart,       label: '찜',   count: data.dataStats?.wishlistCount ?? 0 },
            { icon: ShoppingBag, label: '구매', count: data.dataStats?.purchaseCount ?? 0 },
            { icon: Search,      label: '검색', count: data.dataStats?.searchCount ?? 0 },
          ].map(({ icon: Icon, label, count }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => refetch()}>
        다시 분석하기
      </Button>
    </div>
  )
}
