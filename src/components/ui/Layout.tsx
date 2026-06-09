import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

// Standard page wrapper — responsive horizontal padding per spec.
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-4 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-12 text-center">
      {icon && <div className="text-gray-300">{icon}</div>}
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      {description && (
        <p className="max-w-xs text-xs text-gray-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
