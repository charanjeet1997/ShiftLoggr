import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

// Full-screen slide-up sheet on mobile, centred dialog on desktop (per spec).
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          // `relative z-10` keeps the dialog ABOVE the absolute backdrop so it
          // stays clickable (a `static` dialog gets painted under the backdrop).
          'relative z-10 flex w-full flex-col bg-white shadow-xl',
          // mobile: full-screen sheet; desktop: centred card
          'h-full sm:h-auto sm:max-w-md sm:rounded-2xl sm:max-h-[85vh]',
        )}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          // pt-3 + a bottom pad of at least 0.75rem, growing for the iOS safe
          // area. (Plain `pb-safe` collapsed to 0 on desktop and let the button
          // touch the rounded corner.)
          <footer className="flex gap-2 border-t border-gray-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
