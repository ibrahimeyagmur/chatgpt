import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Globe, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'
import { ShareModal } from '@/components/modals/ShareModal'
import { useChatStore, type Attachment } from '@/state/chatStore'
import { useSettingsStore } from '@/state/settingsStore'

export function ChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  
  const {
    chats,
    messages,
    isStreaming,
    setCurrentChat,
    createChat,
    sendMessage,
    regenerateResponse,
    editAndResend,
    stopStreaming
  } = useChatStore()
  
  const { settings, hasApiKey, saveSettings } = useSettingsStore()
  const displayBaseUrl = settings.baseUrl || 'https://api.openai.com'
  const [selectedModel, setSelectedModel] = useState(settings.lastSelectedModelId || 'gpt-4o')
  const [showApiCard, setShowApiCard] = useState(false)
  const [modelCount, setModelCount] = useState<number | null>(null)
  const cardTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringCard = useRef(false)

  const startCloseTimer = useCallback(() => {
    if (cardTimeoutRef.current) clearTimeout(cardTimeoutRef.current)
    cardTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCard.current) setShowApiCard(false)
    }, 4000)
  }, [])

  const handleBadgeEnter = () => {
    setShowApiCard(true)
    if (cardTimeoutRef.current) clearTimeout(cardTimeoutRef.current)
  }

  const handleBadgeLeave = () => {
    startCloseTimer()
  }

  const handleCardEnter = () => {
    isHoveringCard.current = true
    if (cardTimeoutRef.current) clearTimeout(cardTimeoutRef.current)
  }

  const handleCardLeave = () => {
    isHoveringCard.current = false
    startCloseTimer()
  }

  useEffect(() => {
    return () => {
      if (cardTimeoutRef.current) clearTimeout(cardTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (chatId) {
      const chatExists = chats.find(c => c.id === chatId)
      if (chatExists) {
        setCurrentChat(chatId)
      } else {
        navigate('/')
      }
    } else {
      setCurrentChat(null)
    }
  }, [chatId, chats, setCurrentChat, navigate])

  useEffect(() => {
    if (selectedModel !== settings.lastSelectedModelId) {
      saveSettings({ lastSelectedModelId: selectedModel })
    }
  }, [selectedModel, settings.lastSelectedModelId, saveSettings])

  const currentMessages = chatId ? (messages[chatId] || []) : []
  const currentChat = chats.find(c => c.id === chatId) || null

  const handleSend = async (content: string, attachments?: Attachment[]) => {
    let targetChatId = chatId
    
    if (!targetChatId) {
      targetChatId = createChat()
      navigate(`/c/${targetChatId}`)
    }
    
    await sendMessage(targetChatId, content, selectedModel, attachments)
  }

  const handleRegenerate = async () => {
    if (chatId) {
      await regenerateResponse(chatId, selectedModel)
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (chatId) {
      await editAndResend(chatId, messageId, newContent, selectedModel)
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-chat-bg overflow-hidden">
      <TopBar
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onShare={handleShare}
        hasMessages={currentMessages.length > 0}
      />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {!hasApiKey() && (
          <div className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-400 font-medium">API anahtarı gerekli</p>
              <p className="text-xs text-red-400/80">Sohbet başlatmak için ayarlardan API anahtarınızı girin.</p>
            </div>
          </div>
        )}
        
        <MessageList
          messages={currentMessages}
          isStreaming={isStreaming}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
        />
        
        <Composer
          onSend={handleSend}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          disabled={!hasApiKey()}
        />
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        chat={currentChat}
        messages={currentMessages}
      />

      <div className="fixed bottom-4 right-4 z-10 hidden md:block">
        <div className="relative">
          {showApiCard && (
            <div
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
              className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-chat-sidebar border border-chat-border rounded-xl shadow-2xl origin-bottom-right animate-scale-fade-in"
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-chat-accent" />
                <span className="text-sm font-medium text-chat-text">Baglı API</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-chat-text-secondary">Base URL</span>
                  <span className="text-chat-text truncate max-w-[140px]" title={displayBaseUrl}>
                    {displayBaseUrl.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-chat-text-secondary">Modeller</span>
                  <span className="text-chat-text">
                    {modelCount !== null ? `${modelCount} model` : 'Yüklenmedi'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-chat-text-secondary">Durum</span>
                  <span className="flex items-center gap-1">
                    {!hasApiKey() ? (
                      <><XCircle className="w-3 h-3 text-red-400" /><span className="text-red-400">Anahtar yok</span></>
                    ) : isStreaming ? (
                      <><Loader2 className="w-3 h-3 text-yellow-400 animate-spin" /><span className="text-yellow-400">Baglanıyor...</span></>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3 text-green-400" /><span className="text-green-400">Hazır</span></>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div
            onMouseEnter={handleBadgeEnter}
            onMouseLeave={handleBadgeLeave}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-chat-sidebar/80 backdrop-blur-sm border border-chat-border/50 rounded-full text-xs text-chat-text-secondary hover:text-chat-text hover:border-chat-border transition-all cursor-default"
          >
            <Globe className="w-3 h-3" />
            <span className="max-w-[150px] truncate">{displayBaseUrl.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
