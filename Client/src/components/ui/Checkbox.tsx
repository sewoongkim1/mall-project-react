import { cn } from '@/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', props.disabled && 'opacity-50 cursor-not-allowed', className)}>
      <span className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <span className={cn(
          'w-5 h-5 rounded-md border-2 border-gray-300 transition-all',
          'peer-checked:border-brand-600 peer-checked:bg-brand-600',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200'
        )} />
        <Check
          size={14}
          className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity"
          strokeWidth={3}
        />
      </span>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
)

Checkbox.displayName = 'Checkbox'

/* ── Radio ────────────────────────────────────────── */
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', props.disabled && 'opacity-50 cursor-not-allowed', className)}>
      <span className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="radio"
          className="peer sr-only"
          {...props}
        />
        <span className={cn(
          'w-5 h-5 rounded-full border-2 border-gray-300 transition-all',
          'peer-checked:border-brand-600',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200'
        )} />
        <span className="absolute w-2.5 h-2.5 rounded-full bg-brand-600 scale-0 peer-checked:scale-100 transition-transform" />
      </span>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
)

Radio.displayName = 'Radio'
