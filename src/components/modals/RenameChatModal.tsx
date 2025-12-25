import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface RenameChatModalProps {
  isOpen: boolean
  onClose: () => void
  currentTitle: string
  onRename: (newTitle: string) => void
}

export function RenameChatModal({ isOpen, onClose, currentTitle, onRename }: RenameChatModalProps) {
  const [title, setTitle] = useState(currentTitle)

  useEffect(() => {
    setTitle(currentTitle)
  }, [currentTitle, isOpen])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onRename(title.trim())
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-chat-sidebar border border-chat-border rounded-xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-chat-border">
          <h2 className="text-lg font-semibold text-chat-text">Sohbeti Yeniden Adlandır</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sohbet başlığı"
              autoFocus
              className="w-full px-3 py-2.5 bg-chat-input-bg border border-chat-border rounded-lg text-chat-text placeholder-chat-text-secondary focus:outline-none focus:ring-2 focus:ring-chat-accent focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-chat-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                "bg-chat-accent text-white hover:bg-chat-accent-hover",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
