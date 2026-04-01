import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/index'

const schema = z.object({
  brandName:      z.string().min(2, '브랜드명은 2자 이상이어야 합니다'),
  businessNumber: z.string().min(10, '사업자등록번호를 정확히 입력해주세요'),
  bankName:       z.string().min(1, '은행명을 입력해주세요'),
  bankAccount:    z.string().min(5, '계좌번호를 입력해주세요'),
  storeBio:       z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: '심사 중',  color: 'bg-yellow-100 text-yellow-700' },
  APPROVED:  { label: '승인됨',   color: 'bg-green-100 text-green-700' },
  REJECTED:  { label: '거절됨',   color: 'bg-red-100 text-red-700' },
  SUSPENDED: { label: '정지됨',   color: 'bg-gray-100 text-gray-700' },
}

export default function SellerApplyPage() {
  const { data: sellerStatus, isLoading } = useQuery({
    queryKey: ['seller-status'],
    queryFn: () => api.get('/seller/my-status').then(r => r.data.data),
  })

  const { mutate: apply, isPending } = useMutation({
    mutationFn: (data: FormData) => api.post('/seller/apply', data),
    onSuccess: () => {
      toast.success('셀러 신청이 완료되었습니다! 관리자 승인을 기다려주세요.', { duration: 5000 })
      window.location.reload()
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (isLoading) return <PageSpinner />

  // 이미 신청한 경우 상태 표시
  if (sellerStatus) {
    const status = STATUS_MAP[sellerStatus.status] ?? STATUS_MAP.PENDING
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">셀러 신청 현황</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">신청 상태</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">브랜드명</span>
              <span className="font-medium">{sellerStatus.brandName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">사업자번호</span>
              <span className="font-medium">{sellerStatus.businessNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">신청일</span>
              <span className="font-medium">{new Date(sellerStatus.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            {sellerStatus.approvedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">승인일</span>
                <span className="font-medium">{new Date(sellerStatus.approvedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 신청 폼
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">셀러 신청</h1>
      <p className="text-sm text-gray-500 mb-6">
        StyleAI에서 상품을 판매하려면 셀러 등록이 필요합니다.
        신청 후 관리자 승인이 완료되면 상품을 등록할 수 있습니다.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit((data) => apply(data))} className="space-y-4">
          <Input label="브랜드명" placeholder="스토어에 표시될 브랜드명"
            required error={errors.brandName?.message} {...register('brandName')} />
          <Input label="사업자등록번호" placeholder="000-00-00000"
            required error={errors.businessNumber?.message} {...register('businessNumber')} />
          <Input label="은행명" placeholder="예: 신한은행"
            required error={errors.bankName?.message} {...register('bankName')} />
          <Input label="정산 계좌번호" placeholder="- 없이 입력"
            required error={errors.bankAccount?.message} {...register('bankAccount')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">스토어 소개 (선택)</label>
            <textarea
              placeholder="브랜드를 소개해주세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-24
                         focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              {...register('storeBio')}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={isPending}>
            셀러 신청하기
          </Button>
        </form>
      </div>
    </div>
  )
}
