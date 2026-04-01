export { Button } from './Button'
export { Input } from './Input'
export { Select } from './Select'
export { Textarea } from './Textarea'
export { Modal } from './Modal'
export { Card, CardHeader, CardFooter } from './Card'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
export { Pagination } from './Pagination'
export { Checkbox, Radio } from './Checkbox'

import { cn } from '@/utils'

// ── Badge ─────────────────────────────────────────────
type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'

const badgeStyles: Record<BadgeVariant, string> = {
  blue:   'bg-brand-50 text-brand-700',
  green:  'bg-green-50 text-green-700',
  amber:  'bg-amber-50 text-amber-700',
  red:    'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
  gray:   'bg-gray-100 text-gray-600',
}

export function Badge({
  children,
  variant = 'gray',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      badgeStyles[variant],
      className
    )}>
      {children}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded-xl', className)} />
  )
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full mb-3" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <svg
      className={cn('animate-spin text-brand-600', sizes[size])}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  )
}
