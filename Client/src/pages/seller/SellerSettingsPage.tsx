import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/index'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  brandName:   z.string().min(2, '브랜드명은 2자 이상이어야 합니다'),
  bankName:    z.string().min(1, '은행명을 입력해주세요'),
  bankAccount: z.string().min(5, '계좌번호를 입력해주세요'),
  storeBio:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function SellerSettingsPage() {
  const queryClient = useQueryClient()

  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller-status'],
    queryFn: () => api.get('/seller/my-status').then(r => r.data.data),
  })

  const { mutate: update, isPending } = useMutation({
    mutationFn: (data: FormData) => api.put('/seller/my-info', data),
    onSuccess: () => {
      toast.success('스토어 정보가 수정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['seller-status'] })
    },
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // 기존 데이터로 폼 초기화
  useEffect(() => {
    if (seller) {
      reset({
        brandName:   seller.brandName,
        bankName:    seller.bankName,
        bankAccount: seller.bankAccount,
        storeBio:    seller.storeBio ?? '',
      })
    }
  }, [seller, reset])

  if (isLoading) return <PageSpinner />

  if (!seller || seller.status !== 'APPROVED') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-gray-500">승인된 셀러만 정보를 수정할 수 있습니다.</p>
        <Link to="/seller" className="text-brand-600 text-sm mt-2 inline-block hover:underline">
          돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold">스토어 설정</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit((data) => update(data))} className="space-y-4">
          <Input label="브랜드명" required
            error={errors.brandName?.message} {...register('brandName')} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">스토어 소개</label>
            <textarea
              placeholder="브랜드를 소개해주세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-24
                         focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              {...register('storeBio')}
            />
          </div>

          <hr className="border-gray-100" />
          <p className="text-sm font-medium text-gray-700">정산 정보</p>

          <Input label="은행명" placeholder="예: 신한은행" required
            error={errors.bankName?.message} {...register('bankName')} />
          <Input label="계좌번호" placeholder="- 없이 입력" required
            error={errors.bankAccount?.message} {...register('bankAccount')} />

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
            사업자등록번호는 관리자에게 문의하여 변경할 수 있습니다.
            <br />현재 사업자번호: <strong>{seller.businessNumber}</strong>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isPending}>
            저장하기
          </Button>
        </form>
      </div>
    </div>
  )
}
