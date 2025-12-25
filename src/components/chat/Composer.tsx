import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react'
import { Send, Plus, X, Square, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Attachment } from '@/state/chatStore'

interface ComposerProps {
  onSend: (content: string, attachments?: Attachment[]) => void
  onStop?: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function Composer({ onSend, onStop, isStreaming, disabled }: ComposerProps) {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [content])

  const handleSend = () => {
    if ((!content.trim() && attachments.length === 0) || disabled) return
    onSend(content.trim(), attachments.length > 0 ? attachments : undefined)
    setContent('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming) {
        handleSend()
      }
    }
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          setAttachments(prev => [...prev, {
            type: file.type,
            data: dataUrl,
            name: file.name
          }])
        }
        reader.readAsDataURL(file)
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text()
        setAttachments(prev => [...prev, {
          type: 'text/plain',
          data: text,
          name: file.name
        }])
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const canSend = (content.trim() || attachments.length > 0) && !disabled

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-chat-bg via-chat-bg to-transparent pt-6 pb-4 px-4">
      <div className="max-w-3xl mx-auto">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-chat-input-bg rounded-t-xl border border-b-0 border-chat-border">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative group">
                {attachment.type.startsWith('image/') ? (
                  <div className="relative">
                    <img
                      src={attachment.data}
                      alt={attachment.name}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-chat-bg border border-chat-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2 px-3 py-2 bg-chat-hover rounded-lg">
                    <span className="text-sm text-chat-text truncate max-w-[150px]">{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="w-4 h-4 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={cn(
          "relative flex items-end gap-2 bg-chat-input-bg border border-chat-border rounded-2xl",
          attachments.length > 0 && "rounded-t-none border-t-0"
        )}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.txt"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 p-3 text-chat-text-secondary hover:text-chat-text transition-colors disabled:opacity-50"
            title="Dosya ekle"
          >
            <Plus className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={disabled}
            rows={1}
            className="flex-1 py-3 pr-2 bg-transparent text-chat-text placeholder-chat-text-secondary resize-none focus:outline-none disabled:opacity-50 max-h-[200px]"
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 p-3 text-chat-text hover:text-white transition-colors"
              title="Durdur"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex-shrink-0 p-3 transition-colors",
                canSend
                  ? "text-chat-text hover:text-white"
                  : "text-chat-text-secondary opacity-50 cursor-not-allowed"
              )}
              title="Gönder"
            >
              {disabled ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-chat-text-secondary mt-2">
          ChatGPT hatalar yapabilir. Önemli bilgileri doğrulayın.
        </p>
      </div>
    </div>
  )
}
