import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/index'
import { Users, Store, Shield, ChevronDown, BarChart3, TrendingUp, ShoppingBag, Package } from 'lucide-react'
import type { User } from '@/types'

type Tab = 'stats' | 'sellers' | 'users'

const SELLER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: '대기',  color: 'bg-yellow-100 text-yellow-700' },
  APPROVED:  { label: '승인',  color: 'bg-green-100 text-green-700' },
  REJECTED:  { label: '거절',  color: 'bg-red-100 text-red-700' },
  SUSPENDED: { label: '정지',  color: 'bg-gray-100 text-gray-700' },
}

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  BUYER:  { label: '구매자', color: 'bg-blue-100 text-blue-700' },
  SELLER: { label: '셀러',  color: 'bg-green-100 text-green-700' },
  ADMIN:  { label: '관리자', color: 'bg-purple-100 text-purple-700' },
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('stats')
  const [sellerFilter, setSellerFilter] = useState('')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${tab === 'stats' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <BarChart3 className="w-4 h-4" /> 통계
        </button>
        <button onClick={() => setTab('sellers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${tab === 'sellers' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <Store className="w-4 h-4" /> 셀러
        </button>
        <button onClick={() => setTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${tab === 'users' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <Users className="w-4 h-4" /> 회원
        </button>
      </div>

      {tab === 'stats' && <StatsOverview />}
      {tab === 'sellers' && <SellerManagement filter={sellerFilter} setFilter={setSellerFilter} />}
      {tab === 'users' && <UserManagement />}
    </div>
  )
}

// ── 통계 개요 ─────────────────────────────────────────
function StatsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.data),
  })

  if (isLoading) return <PageSpinner />

  const s = data?.summary ?? {}
  const cmp = data?.comparison ?? {}

  function growth(current: number, previous: number) {
    if (!previous) return current > 0 ? '+100%' : '0%'
    const pct = Math.round(((current - previous) / previous) * 100)
    return pct >= 0 ? `+${pct}%` : `${pct}%`
  }

  const ORDER_STATUS: Record<string, string> = {
    PENDING: '접수', PAYMENT_CONFIRMED: '결제완료', PREPARING: '준비',
    SHIPPED: '배송중', DELIVERED: '완료', CANCELLED: '취소',
  }

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '이번 달 매출', value: `${(s.thisMonthRevenue ?? 0).toLocaleString()}원`, change: growth(cmp.revenue?.current, cmp.revenue?.previous), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: '총 주문', value: `${s.totalOrders ?? 0}건`, change: growth(cmp.orders?.current, cmp.orders?.previous), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: '총 회원', value: `${s.totalUsers ?? 0}명`, change: '', icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: '등록 상품', value: `${s.totalProducts ?? 0}개`, change: '', icon: Package, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{label}</span>
              <div className={`p-1.5 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
            </div>
            <p className="text-xl font-bold">{value}</p>
            {change && <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>전월 대비 {change}</p>}
          </div>
        ))}
      </div>

      {/* 회원 구성 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold mb-3 text-sm">회원 구성</h3>
          <div className="space-y-2">
            {Object.entries(data?.usersByRole ?? {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{ROLE_MAP[role]?.label ?? role}</span>
                <span className="font-medium">{String(count)}명</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold mb-3 text-sm">이번 달 행동 로그</h3>
          <div className="space-y-2">
            {Object.entries(data?.behaviorStats ?? {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{type}</span>
                <span className="font-medium">{String(count)}건</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 주문 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-bold mb-3 text-sm">최근 주문</h3>
        {data?.recentOrders?.length ? (
          <div className="space-y-2">
            {data.recentOrders.map((o: any) => (
              <div key={o._id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-gray-600">{o.orderNumber}</span>
                  <span className="text-gray-400 ml-2">{o.buyerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{o.totalAmount?.toLocaleString()}원</span>
                  <span className="text-xs text-gray-400">{ORDER_STATUS[o.status] ?? o.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">주문이 없습니다</p>
        )}
      </div>
    </div>
  )
}

// ── 셀러 관리 ─────────────────────────────────────────
function SellerManagement({ filter, setFilter }: { filter: string; setFilter: (v: string) => void }) {
  const queryClient = useQueryClient()

  const { data: sellers, isLoading } = useQuery({
    queryKey: ['admin-sellers', filter],
    queryFn: () => api.get(`/admin/sellers${filter ? `?status=${filter}` : ''}`).then(r => r.data.data),
  })

  const { mutate: review } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/sellers/${id}`, { status }),
    onSuccess: (_, { status }) => {
      toast.success(status === 'APPROVED' ? '셀러가 승인되었습니다' : '셀러가 거절되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] })
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {[
          { value: '',          label: '전체' },
          { value: 'PENDING',   label: '대기 중' },
          { value: 'APPROVED',  label: '승인됨' },
          { value: 'REJECTED',  label: '거절됨' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors
              ${filter === f.value ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {!sellers?.length ? (
        <div className="text-center py-12 text-gray-400">
          {filter ? '해당 상태의 셀러가 없습니다' : '셀러 신청이 없습니다'}
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map((s: any) => {
            const status = SELLER_STATUS_MAP[s.status] ?? SELLER_STATUS_MAP.PENDING
            return (
              <div key={s._id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{s.brandName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{s.user?.nickname} ({s.user?.email})</p>
                    <p className="text-xs text-gray-400 mt-1">
                      사업자번호: {s.businessNumber} | 정산: {s.bankName} {s.bankAccount}
                    </p>
                    {s.storeBio && <p className="text-xs text-gray-400 mt-1">{s.storeBio}</p>}
                    <p className="text-xs text-gray-300 mt-1">
                      신청일: {new Date(s.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>

                  {s.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => review({ id: s._id, status: 'APPROVED' })}>
                        승인
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => review({ id: s._id, status: 'REJECTED' })}>
                        거절
                      </Button>
                    </div>
                  )}
                  {s.status === 'APPROVED' && (
                    <Button size="sm" variant="outline" onClick={() => review({ id: s._id, status: 'SUSPENDED' })}>
                      정지
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 회원 관리 ─────────────────────────────────────────
function UserManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get(`/admin/users?page=${page}&limit=20`).then(r => r.data.data),
  })

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('회원 역할이 변경되었습니다')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      {/* 회원 목록 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">회원</th>
              <th className="text-left px-4 py-3 font-medium">역할</th>
              <th className="text-left px-4 py-3 font-medium">가입일</th>
              <th className="text-right px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data?.items?.map((user: User) => {
              const role = ROLE_MAP[user.role] ?? ROLE_MAP.BUYER
              return (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.nickname}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RoleDropdown userId={user._id} currentRole={user.role} onChangeRole={changeRole} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 역할 변경 드롭다운 ─────────────────────────────────
function RoleDropdown({ userId, currentRole, onChangeRole }: {
  userId: string; currentRole: string
  onChangeRole: (params: { id: string; role: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const roles = ['BUYER', 'SELLER', 'ADMIN'] as const

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200">
        변경 <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-100 rounded-lg shadow-lg z-10">
            {roles.filter(r => r !== currentRole).map(role => (
              <button key={role} onClick={() => { onChangeRole({ id: userId, role }); setOpen(false) }}
                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50">
                {ROLE_MAP[role].label}로 변경
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
