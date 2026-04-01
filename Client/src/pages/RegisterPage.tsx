import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRegister, useUpdatePreferences } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils'

// Step 1: 계정 정보
const accountSchema = z.object({
  email:    z.string().email('이메일 형식이 올바르지 않습니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다')
             .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다')
             .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  passwordConfirm: z.string(),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
}).refine((d) => d.password === d.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path:    ['passwordConfirm'],
})

type AccountForm = z.infer<typeof accountSchema>

const STYLES    = ['캐주얼', '포멀', '스트릿', '미니멀', '빈티지', '스포티', '럭셔리', '로맨틱']
const SIZES     = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const PRICE_RANGES = [
  { label: '1~3만원',  min: 10000,  max: 30000  },
  { label: '3~7만원',  min: 30000,  max: 70000  },
  { label: '7~15만원', min: 70000,  max: 150000 },
  { label: '15만원+',  min: 150000, max: undefined },
]

const STEPS = ['계정 정보', '추가 정보', 'AI 취향 설정']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedSizes,  setSelectedSizes]  = useState<string[]>([])
  const [selectedPrice,  setSelectedPrice]  = useState<number | null>(null)

  const { mutate: register, isPending: registering } = useRegister()
  const { mutate: updatePref, isPending: savingPref } = useUpdatePreferences()

  const { register: reg, handleSubmit, formState: { errors } } =
    useForm<AccountForm>({ resolver: zodResolver(accountSchema) })

  function onAccountSubmit(data: AccountForm) {
    register({
      email:    data.email,
      password: data.password,
      nickname: data.nickname,
    })
    // 회원가입 성공 후 useRegister의 onSuccess에서 /onboarding 으로 이동
    // 여기서는 step을 올려 취향 설문 먼저 보여줌
    setStep(2)
  }

  function onPreferenceSubmit() {
    const range = PRICE_RANGES[selectedPrice ?? -1]
    updatePref({
      styles:   selectedStyles,
      sizes:    selectedSizes,
      minPrice: range?.min,
      maxPrice: range?.max,
    })
  }

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-brand-600">StyleAI</Link>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  i < step  ? 'bg-brand-600 text-white' :
                  i === step ? 'bg-white border-2 border-brand-600 text-brand-600' :
                               'bg-gray-100 text-gray-400'
                )}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={cn(
                  'text-[10px] whitespace-nowrap hidden sm:block',
                  i === step ? 'text-brand-600 font-medium' : 'text-gray-400'
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-brand-600' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

          {/* Step 0: 계정 정보 */}
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold text-center mb-6">계정 만들기</h1>
              <form onSubmit={handleSubmit(onAccountSubmit)} className="space-y-4">
                <Input label="이메일" type="email" placeholder="example@email.com"
                  required error={errors.email?.message} {...reg('email')} />
                <Input label="닉네임" placeholder="닉네임 (2자 이상)"
                  required error={errors.nickname?.message} {...reg('nickname')} />
                <Input label="비밀번호" type="password" placeholder="8자 이상, 영문+숫자"
                  required error={errors.password?.message} {...reg('password')}
                  hint="영문, 숫자 포함 8자 이상" />
                <Input label="비밀번호 확인" type="password" placeholder="비밀번호 재입력"
                  required error={errors.passwordConfirm?.message} {...reg('passwordConfirm')} />

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" required className="mt-0.5 rounded" id="terms" />
                  <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer">
                    <Link to="/terms" className="text-brand-600 hover:underline">이용약관</Link> 및{' '}
                    <Link to="/privacy" className="text-brand-600 hover:underline">개인정보처리방침</Link>에 동의합니다
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" loading={registering}>
                  다음 단계 →
                </Button>
              </form>
            </>
          )}

          {/* Step 2: AI 취향 설정 */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">AI 추천</span>
                <h1 className="text-lg font-bold">취향 설정</h1>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                선호하는 스타일을 선택하면 AI가 딱 맞는 옷을 추천해드려요!
              </p>

              {/* 스타일 */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">선호 스타일 (복수 선택)</p>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button key={s} type="button"
                      onClick={() => setSelectedStyles((p) => toggle(p, s))}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border transition-colors',
                        selectedStyles.includes(s)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300'
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 사이즈 */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">주로 입는 사이즈</p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((s) => (
                    <button key={s} type="button"
                      onClick={() => setSelectedSizes((p) => toggle(p, s))}
                      className={cn(
                        'px-3 py-2 rounded-xl text-sm border transition-colors',
                        selectedSizes.includes(s)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300'
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 가격대 */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">선호 가격대</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRICE_RANGES.map((r, i) => (
                    <button key={i} type="button"
                      onClick={() => setSelectedPrice(i === selectedPrice ? null : i)}
                      className={cn(
                        'py-2 rounded-xl text-sm border transition-colors',
                        selectedPrice === i
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300'
                      )}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full" size="lg" loading={savingPref}
                onClick={onPreferenceSubmit}>
                완료 — AI 추천 받기 ✨
              </Button>
              <button onClick={() => onPreferenceSubmit()}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3">
                건너뛰기
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  )
}
