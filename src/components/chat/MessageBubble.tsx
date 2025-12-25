import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThumbsUp, ThumbsDown, RotateCcw, Pencil, Copy, Check, User, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { CodeBlock } from './CodeBlock'
import type { Message, Attachment } from '@/state/chatStore'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onRegenerate?: () => void
  onEdit?: (newContent: string) => void
}

export function MessageBubble({ message, isStreaming, onRegenerate, onEdit }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(editContent)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const renderAttachments = (attachments: Attachment[]) => {
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {attachments.map((attachment, index) => {
          if (attachment.type.startsWith('image/')) {
            return (
              <img
                key={index}
                src={attachment.data}
                alt={attachment.name}
                className="max-w-xs max-h-48 rounded-lg object-cover"
              />
            )
          }
          return (
            <div key={index} className="px-3 py-2 bg-chat-hover rounded-lg text-sm">
              {attachment.name}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("group py-3", isUser ? "bg-transparent" : "bg-transparent")}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={cn("flex gap-2.5", isUser && "justify-end")}>
          {!isUser && (
            <div className="w-7 h-7 rounded-full bg-chat-accent flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          
          <div className={cn("flex-1 min-w-0", isUser && "flex justify-end")}>
            <div className={cn(
              "inline-block max-w-full",
              isUser && "bg-chat-user-bubble rounded-2xl px-4 py-2.5"
            )}>
              {message.attachments && message.attachments.length > 0 && renderAttachments(message.attachments)}
              
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full min-h-[100px] p-3 bg-chat-input-bg border border-chat-border rounded-lg text-chat-text resize-none focus:outline-none focus:ring-2 focus:ring-chat-accent"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-sm text-chat-text-secondary hover:text-chat-text rounded-lg hover:bg-chat-hover transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 text-sm bg-chat-accent text-white rounded-lg hover:bg-chat-accent-hover transition-colors"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-chat-text">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !String(children).includes('\n')
                        
                        if (isInline) {
                          return (
                            <code className="px-1.5 py-0.5 bg-chat-code-bg rounded text-sm" {...props}>
                              {children}
                            </code>
                          )
                        }
                        
                        return (
                          <CodeBlock language={match?.[1]}>
                            {String(children).replace(/\n$/, '')}
                          </CodeBlock>
                        )
                      },
                      p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-6 mb-2">{children}</ul>
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-6 mb-2">{children}</ol>
                      },
                      a({ href, children }) {
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-chat-accent hover:underline">
                            {children}
                          </a>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            
            {!isEditing && !isStreaming && (
              <div className={cn(
                "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
                isUser ? "justify-end" : "justify-start"
              )}>
                {isUser ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
                      title="Kopyala"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                      className={cn(
                        "p-1.5 hover:bg-chat-hover rounded-lg transition-colors",
                        feedback === 'up' ? "text-chat-accent" : "text-chat-text-secondary hover:text-chat-text"
                      )}
                      title="İyi yanıt"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                      className={cn(
                        "p-1.5 hover:bg-chat-hover rounded-lg transition-colors",
                        feedback === 'down' ? "text-red-400" : "text-chat-text-secondary hover:text-chat-text"
                      )}
                      title="Kötü yanıt"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    {onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="p-1.5 text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
                        title="Yeniden oluştur"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {isUser && (
            <div className="w-7 h-7 rounded-full bg-chat-user-bubble flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5 text-chat-text" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
