import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-gray-300 bg-white px-3',
          'min-h-[44px] text-gray-900',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          error && 'border-red-400',
          className,
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
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
