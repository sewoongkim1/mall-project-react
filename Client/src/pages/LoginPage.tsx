import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email:    z.string().email('이메일 형식이 올바르지 않습니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

type FormData = z.infer<typeof schema>

// 소셜 로그인: 로컬은 proxy, 프로덕션은 서버 도메인 직접 사용
const serverBase = import.meta.env.VITE_SERVER_URL ?? ''

function SocialLoginButtons() {
  return (
    <div className="space-y-2">
      <a href={`${serverBase}/api/auth/kakao`}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                   border border-gray-200 rounded-xl text-sm hover:bg-yellow-50 transition-colors">
        <div className="w-5 h-5 rounded-full bg-yellow-400 flex-shrink-0" />
        카카오로 계속하기
      </a>
      <a href={`${serverBase}/api/auth/google`}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                   border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-colors">
        <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0" />
        구글로 계속하기
      </a>
    </div>
  )
}

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => login(data)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-brand-600">StyleAI</Link>
          <p className="text-gray-500 mt-2 text-sm">AI 패션 큐레이터</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-center mb-6">로그인</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">로그인 상태 유지</span>
              </label>
              <Link to="/forgot-password" className="text-brand-600 hover:underline">
                비밀번호 찾기
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isPending}>
              로그인
            </Button>
          </form>

          {/* 소셜 로그인 구분선 */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는 소셜 로그인</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 소셜 버튼 */}
          <SocialLoginButtons />

          <p className="text-center text-sm text-gray-500 mt-6">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
