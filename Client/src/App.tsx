import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GNB } from '@/components/features/layout/GNB'
import { useIsLoggedIn } from '@/store/authStore'

// Pages (lazy loading)
import { lazy, Suspense } from 'react'
import { PageSpinner } from '@/components/ui/index'

const HomePage          = lazy(() => import('@/pages/HomePage'))
const ProductListPage   = lazy(() => import('@/pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CartPage          = lazy(() => import('@/pages/CartPage'))
const LoginPage         = lazy(() => import('@/pages/LoginPage'))
const RegisterPage      = lazy(() => import('@/pages/RegisterPage'))
const MyPage            = lazy(() => import('@/pages/MyPage'))

// 로그인 필요 라우트 가드
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useIsLoggedIn()
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

// 메인 레이아웃 (GNB + 컨텐츠)
function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <GNB />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © 2026 StyleAI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* 인증 페이지 (GNB 없음) */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 쇼핑몰 메인 */}
          <Route path="/" element={
            <ShopLayout><HomePage /></ShopLayout>
          }/>
          <Route path="/products" element={
            <ShopLayout><ProductListPage /></ShopLayout>
          }/>
          <Route path="/products/:id" element={
            <ShopLayout><ProductDetailPage /></ShopLayout>
          }/>
          <Route path="/cart" element={
            <ShopLayout>
              <PrivateRoute><CartPage /></PrivateRoute>
            </ShopLayout>
          }/>
          <Route path="/mypage/*" element={
            <ShopLayout>
              <PrivateRoute><MyPage /></PrivateRoute>
            </ShopLayout>
          }/>

          {/* 404 */}
          <Route path="*" element={
            <ShopLayout>
              <div className="text-center py-20">
                <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
                <p className="text-gray-500">페이지를 찾을 수 없습니다</p>
              </div>
            </ShopLayout>
          }/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
