import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-gray-300 bg-white px-3',
          'min-h-[44px] text-gray-900 placeholder:text-gray-400',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
