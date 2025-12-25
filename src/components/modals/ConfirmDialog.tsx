import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'default'
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm mx-4 bg-chat-sidebar border border-chat-border rounded-xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-chat-border">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <h2 className="text-lg font-semibold text-chat-text">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-chat-text-secondary">{message}</p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-chat-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              variant === 'danger'
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-chat-accent text-white hover:bg-chat-accent-hover"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
