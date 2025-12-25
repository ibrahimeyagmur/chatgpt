import { useState } from 'react'
import { X, Copy, Check, FileJson, FileText } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Chat, Message } from '@/state/chatStore'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  chat: Chat | null
  messages: Message[]
}

export function ShareModal({ isOpen, onClose, chat, messages }: ShareModalProps) {
  const [copiedType, setCopiedType] = useState<'text' | 'json' | null>(null)

  const generateTranscript = () => {
    if (!chat) return ''
    
    let transcript = `# ${chat.title}\n\n`
    
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'Kullanıcı' : 'Asistan'
      transcript += `## ${role}\n${msg.content}\n\n`
    })
    
    return transcript.trim()
  }

  const generateJson = () => {
    if (!chat) return ''
    
    return JSON.stringify({
      chat: {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt
      }))
    }, null, 2)
  }

  const handleCopyText = async () => {
    const transcript = generateTranscript()
    await navigator.clipboard.writeText(transcript)
    setCopiedType('text')
    setTimeout(() => setCopiedType(null), 2000)
  }

  const handleCopyJson = async () => {
    const json = generateJson()
    await navigator.clipboard.writeText(json)
    setCopiedType('json')
    setTimeout(() => setCopiedType(null), 2000)
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
          <h2 className="text-lg font-semibold text-chat-text">Sohbeti Paylaş</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-chat-text-secondary mb-4">
            Sohbetinizi metin veya JSON formatında kopyalayabilirsiniz.
          </p>

          <button
            onClick={handleCopyText}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
              "border-chat-border hover:bg-chat-hover"
            )}
          >
            <FileText className="w-5 h-5 text-chat-text-secondary" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-chat-text">Metin olarak kopyala</div>
              <div className="text-xs text-chat-text-secondary">Markdown formatında döküm</div>
            </div>
            {copiedType === 'text' ? (
              <Check className="w-5 h-5 text-chat-accent" />
            ) : (
              <Copy className="w-5 h-5 text-chat-text-secondary" />
            )}
          </button>

          <button
            onClick={handleCopyJson}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
              "border-chat-border hover:bg-chat-hover"
            )}
          >
            <FileJson className="w-5 h-5 text-chat-text-secondary" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-chat-text">JSON olarak kopyala</div>
              <div className="text-xs text-chat-text-secondary">Tam veri yapısı</div>
            </div>
            {copiedType === 'json' ? (
              <Check className="w-5 h-5 text-chat-accent" />
            ) : (
              <Copy className="w-5 h-5 text-chat-text-secondary" />
            )}
          </button>
        </div>

        <div className="px-6 py-4 border-t border-chat-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
