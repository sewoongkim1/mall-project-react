import { cn } from '@/utils'
import { type HTMLAttributes, type ReactNode } from 'react'

/* ── Card ─────────────────────────────────────────── */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ hover = false, padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white shadow-card',
        hover && 'transition-shadow hover:shadow-card-hover',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── Card.Header ──────────────────────────────────── */
export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('pb-3 border-b border-gray-100', className)}>
      {children}
    </div>
  )
}

/* ── Card.Footer ──────────────────────────────────── */
export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('pt-3 border-t border-gray-100', className)}>
      {children}
    </div>
  )
}
