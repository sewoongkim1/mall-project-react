import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productApi, uploadApi } from '@/api/product.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/index'
import { ArrowLeft, Plus, X, ImagePlus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, type ProductCategory } from '@/types'

interface VariantRow {
  size: string; color: string; stockQty: number; sku: string
}
interface ImageItem {
  url: string; isMain: boolean; sortOrder: number; file?: File
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

export default function SellerProductFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  // 기본 정보
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<ProductCategory>('TOP')
  const [styleTags, setStyleTags] = useState('')

  // 이미지
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploading, setUploading] = useState(false)

  // 옵션 (variants)
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: '', color: '', stockQty: 0, sku: '' },
  ])

  // 수정 모드: 기존 데이터 로드
  const { data: existing, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getOne(id!).then(r => r.data.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description)
      setPrice(String(existing.price))
      setCategory(existing.category)
      setStyleTags(existing.styleTags?.join(', ') ?? '')
      setImages(existing.images?.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })) ?? [])
      setVariants(existing.variants?.length ? existing.variants : [{ size: '', color: '', stockQty: 0, sku: '' }])
    }
  }, [existing])

  // 이미지 업로드
  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 5) {
      toast.error('이미지는 최대 5장까지 업로드할 수 있습니다')
      return
    }

    setUploading(true)
    try {
      const res = await uploadApi.images(files)
      const newImages: ImageItem[] = res.data.data.map((img, i) => ({
        url: img.url,
        isMain: images.length === 0 && i === 0,
        sortOrder: images.length + i,
      }))
      setImages(prev => [...prev, ...newImages])
      toast.success(`${files.length}장 업로드 완료`)
    } catch {
      toast.error('이미지 업로드에 실패했습니다')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(idx: number) {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length && !next.some(img => img.isMain)) next[0].isMain = true
      return next
    })
  }

  function setMainImage(idx: number) {
    setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === idx })))
  }

  // variant 관리
  function addVariant() {
    setVariants(prev => [...prev, { size: '', color: '', stockQty: 0, sku: '' }])
  }
  function removeVariant(idx: number) {
    setVariants(prev => prev.filter((_, i) => i !== idx))
  }
  function updateVariant(idx: number, field: keyof VariantRow, value: string | number) {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  // 제출
  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        description,
        price: Number(price),
        category,
        styleTags: styleTags.split(',').map(s => s.trim()).filter(Boolean),
        images: images.map((img, i) => ({ url: img.url, isMain: img.isMain, sortOrder: i })),
        variants: variants.filter(v => v.size && v.color && v.sku),
      }
      if (isEdit) {
        return productApi.update(id!, body)
      }
      return productApi.create(body as any)
    },
    onSuccess: () => {
      toast.success(isEdit ? '상품이 수정되었습니다' : '상품이 등록되었습니다')
      navigate('/seller/products')
    },
  })

  if (isEdit && isLoading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller/products" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold">{isEdit ? '상품 수정' : '상품 등록'}</h1>
      </div>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4">기본 정보</h2>
          <div className="space-y-4">
            <Input label="상품명" required value={name} onChange={e => setName(e.target.value)}
              placeholder="상품명을 입력하세요" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 <span className="text-red-500">*</span></label>
              <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                {CATEGORIES.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <Input label="가격 (원)" required type="number" value={price}
              onChange={e => setPrice(e.target.value)} placeholder="0" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명 <span className="text-red-500">*</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="상품 상세 설명을 입력하세요 (10자 이상)"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-32
                           focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>

            <Input label="스타일 태그" value={styleTags} onChange={e => setStyleTags(e.target.value)}
              placeholder="캐주얼, 미니멀, 오버핏 (쉼표로 구분)" hint="최대 5개" />
          </div>
        </section>

        {/* 이미지 */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4">상품 이미지 <span className="text-xs text-gray-400 font-normal">최대 5장</span></h2>
          <div className="flex gap-3 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </button>
                <button onClick={() => setMainImage(i)}
                  className={`absolute bottom-1 left-1 p-0.5 rounded ${img.isMain ? 'text-yellow-400' : 'text-white/60 opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  <Star className="w-4 h-4" fill={img.isMain ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 transition-colors">
                <ImagePlus className="w-6 h-6 text-gray-300" />
                <span className="text-[10px] text-gray-400 mt-1">{uploading ? '업로드...' : '추가'}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} disabled={uploading} />
              </label>
            )}
          </div>
        </section>

        {/* 옵션 (variants) */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">옵션 (사이즈/색상) <span className="text-red-500">*</span></h2>
            <button onClick={addVariant} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> 옵션 추가
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}
                  placeholder="사이즈" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
                <input value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)}
                  placeholder="색상" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
                <input type="number" value={v.stockQty} onChange={e => updateVariant(i, 'stockQty', Number(e.target.value))}
                  placeholder="재고" className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
                <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                  placeholder="SKU" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
                {variants.length > 1 && (
                  <button onClick={() => removeVariant(i)} className="p-2 text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 제출 */}
        <Button onClick={() => submit()} className="w-full" size="lg" loading={isPending || uploading}
          disabled={!name || !description || !price || !variants.some(v => v.size && v.color && v.sku)}>
          {isEdit ? '상품 수정하기' : '상품 등록하기'}
        </Button>
      </div>
    </div>
  )
}
