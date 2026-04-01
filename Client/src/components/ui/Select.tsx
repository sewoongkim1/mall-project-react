import { cn } from '@/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?:       string
  error?:       string
  options:      SelectOption[]
  placeholder?: string
  size?:        'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-3 py-2.5',
  lg: 'text-base px-4 py-3',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, size = 'md', className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-xl border bg-white transition-all outline-none appearance-none',
          'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          sizes[size],
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)

Select.displayName = 'Select'
