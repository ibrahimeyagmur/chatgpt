import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '@/state/chatStore'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  onRegenerate: () => void
  onEditMessage: (messageId: string, newContent: string) => void
}

export function MessageList({ messages, isStreaming, onRegenerate, onEditMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-chat-hover flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chat-text">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-chat-text mb-2">Bugün size nasıl yardımcı olabilirim?</h2>
          <p className="text-chat-text-secondary text-sm mb-6">
            Herhangi bir konuda soru sorabilir, yardım isteyebilir veya sadece sohbet edebilirsiniz.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Bir hikaye yaz", "Kod yazarken yardım et", "Bir kavramı açıkla", "Fikir üret"].map((prompt) => (
              <span
                key={prompt}
                className="px-3 py-1.5 text-sm bg-chat-hover text-chat-text-secondary rounded-full cursor-default"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const lastAssistantIndex = messages.findLastIndex(m => m.role === 'assistant')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="pb-32">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
            onRegenerate={index === lastAssistantIndex && !isStreaming ? onRegenerate : undefined}
            onEdit={message.role === 'user' ? (content) => onEditMessage(message.id, content) : undefined}
          />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="py-4 max-w-3xl mx-auto px-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-chat-accent flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
