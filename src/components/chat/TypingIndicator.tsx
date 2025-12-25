export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="w-2 h-2 bg-chat-text-secondary rounded-full typing-dot" />
      <div className="w-2 h-2 bg-chat-text-secondary rounded-full typing-dot" />
      <div className="w-2 h-2 bg-chat-text-secondary rounded-full typing-dot" />
    </div>
  )
}
