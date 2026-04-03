import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { orderApi } from '@/api/order.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShoppingBag } from 'lucide-react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [address, setAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [memo, setMemo] = useState('')

  const shippingFee = totalPrice() >= 50000 ? 0 : 3000
  const finalTotal = totalPrice() + shippingFee

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: () => orderApi.create({
      items: items.map(item => ({
        productId:    item.productId,
        variantSku:   item.variantId,
        productName:  item.productName,
        productImage: item.productImage,
        size:         item.size,
        color:        item.color,
        price:        item.price,
        quantity:     item.quantity,
        sellerName:   item.sellerName,
        sellerId:     item.sellerId,
      })),
      shippingAddress: { name, phone, zipCode, address, detailAddress, memo },
    }),
    onSuccess: (res) => {
      const order = res.data.data
      const IMP_CODE = import.meta.env.VITE_PORTONE_IMP_CODE

      // 포트원 IMP 코드가 있으면 실결제, 없으면 Mock
      if (IMP_CODE && (window as any).IMP) {
        const IMP = (window as any).IMP
        IMP.init(IMP_CODE)
        IMP.request_pay(
          {
            pg: 'html5_inicis',
            pay_method: 'card',
            merchant_uid: order._id,
            name: items.length > 1 ? `${items[0].productName} 외 ${items.length - 1}건` : items[0].productName,
            amount: order.totalAmount,
            buyer_name: name,
            buyer_tel: phone,
            buyer_addr: `${address} ${detailAddress}`,
          },
          async (rsp: any) => {
            if (rsp.success) {
              try {
                await orderApi.create({ impUid: rsp.imp_uid, merchantUid: order._id })
                // 위 대신 verify 호출
                const api = await import('@/api/axios')
                await api.default.post('/payments/verify', { impUid: rsp.imp_uid, merchantUid: order._id })
                clearCart()
                toast.success('결제가 완료되었습니다!', { duration: 5000 })
                navigate(`/order/success?orderId=${order._id}`, { replace: true })
              } catch {
                toast.error('결제 검증에 실패했습니다')
              }
            } else {
              toast.error(`결제 실패: ${rsp.error_msg}`)
              // 주문은 PENDING 상태로 유지
            }
          }
        )
      } else {
        // Mock 결제 (포트원 미설정)
        clearCart()
        orderApi.confirmPayment(order._id).then(() => {
          toast.success('주문이 완료되었습니다!', { duration: 5000 })
          navigate(`/order/success?orderId=${order._id}`, { replace: true })
        })
      }
    },
  })

  if (!items.length) {
    navigate('/cart', { replace: true })
    return null
  }

  const isValid = name && phone && zipCode && address

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6" /> 주문/결제
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 배송지 + 상품 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 배송지 정보 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4">배송지 정보</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="수령인" required value={name} onChange={e => setName(e.target.value)} placeholder="이름" />
                <Input label="연락처" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="우편번호" required value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="12345" />
                <div className="col-span-2">
                  <Input label="주소" required value={address} onChange={e => setAddress(e.target.value)} placeholder="기본 주소" />
                </div>
              </div>
              <Input label="상세 주소" value={detailAddress} onChange={e => setDetailAddress(e.target.value)} placeholder="동/호수" />
              <Input label="배송 메모" value={memo} onChange={e => setMemo(e.target.value)} placeholder="부재시 문 앞에 놓아주세요" />
            </div>
          </section>

          {/* 주문 상품 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4">주문 상품 ({items.length}개)</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.variantId} className="flex gap-3 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.color} / {item.size} | {item.quantity}개</p>
                    <p className="text-xs text-gray-400">{item.sellerName}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0">{(item.price * item.quantity).toLocaleString()}원</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 오른쪽: 결제 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold mb-4">결제 금액</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">상품 금액</span>
                <span>{totalPrice().toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송비</span>
                <span>{shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-400">5만원 이상 구매 시 무료배송</p>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-lg">
                <span>총 결제금액</span>
                <span className="text-brand-600">{finalTotal.toLocaleString()}원</span>
              </div>
            </div>

            <Button className="w-full mt-6" size="lg" loading={isPending}
              disabled={!isValid}
              onClick={() => createOrder()}>
              {finalTotal.toLocaleString()}원 결제하기
            </Button>

            {!isValid && (
              <p className="text-xs text-red-500 text-center mt-2">배송지 정보를 모두 입력해주세요</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
