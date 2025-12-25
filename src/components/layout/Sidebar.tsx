import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { SidebarHeader } from './SidebarHeader'
import { SidebarChatList } from './SidebarChatList'
import { useChatStore } from '@/state/chatStore'
import { useUIStore } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'

interface SidebarProps {
  onRenameChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onShareChat: (chatId: string) => void
}

export function Sidebar({ onRenameChat, onDeleteChat, onShareChat }: SidebarProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { chats, messages, togglePinChat, searchChats } = useChatStore()
  const location = useLocation()
  const { sidebarCollapsed, sidebarOpenMobile, isMobile, toggleSidebar, setSidebarOpenMobile } = useUIStore()
  const { openSettings } = useSettingsStore()

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    return searchChats(searchQuery)
  }, [chats, searchQuery, searchChats])

  const handleNewChat = () => {
    const isOnHomePage = location.pathname === '/'
    const currentChatId = location.pathname.match(/\/c\/(.+)/)?.[1]
    const currentChatMessages = currentChatId ? (messages[currentChatId] || []) : []
    const hasUserMessages = currentChatMessages.some(m => m.role === 'user')

    if (isOnHomePage || !hasUserMessages) {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
      if (textarea) {
        textarea.focus()
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      navigate('/')
    }

    if (isMobile) {
      setSidebarOpenMobile(false)
    }
  }

  const sidebarContent = (
    <div className={cn(
      "h-full flex flex-col bg-chat-sidebar transition-all duration-200",
      sidebarCollapsed && !isMobile ? "w-16" : "w-64"
    )}>
      <SidebarHeader
        collapsed={sidebarCollapsed && !isMobile}
        onToggle={toggleSidebar}
        onNewChat={handleNewChat}
      />

      {(!sidebarCollapsed || isMobile) && (
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sohbetleri ara..."
              className="w-full pl-9 pr-3 py-2 bg-chat-hover border border-transparent rounded-lg text-sm text-chat-text placeholder-chat-text-secondary focus:outline-none focus:border-chat-border"
            />
          </div>
        </div>
      )}

      <SidebarChatList
        chats={filteredChats}
        collapsed={sidebarCollapsed && !isMobile}
        onRename={onRenameChat}
        onDelete={onDeleteChat}
        onPin={togglePinChat}
        onShare={onShareChat}
      />

      <div className="mt-auto p-2">
        <button
          onClick={openSettings}
          className={cn(
            "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-chat-text-secondary hover:text-chat-text",
            "hover:bg-chat-hover/80",
            sidebarCollapsed && !isMobile && "justify-center px-2"
          )}
          title={sidebarCollapsed && !isMobile ? "Ayarlar" : undefined}
        >
          <SlidersHorizontal className="w-[18px] h-[18px]" />
          {(!sidebarCollapsed || isMobile) && <span className="text-[13px] font-medium">Ayarlar</span>}
        </button>
      </div>
    </div>
  )

  useEffect(() => {
    if (isMobile && sidebarOpenMobile) {
      document.body.classList.add('body-scroll-lock')
    } else {
      document.body.classList.remove('body-scroll-lock')
    }
    return () => {
      document.body.classList.remove('body-scroll-lock')
    }
  }, [isMobile, sidebarOpenMobile])

  if (isMobile) {
    return (
      <>
        {sidebarOpenMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpenMobile(false)}
          />
        )}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200",
          sidebarOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </div>
      </>
    )
  }

  return (
    <div className={cn(
      "flex-shrink-0 border-r border-chat-border sidebar-transition",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {sidebarContent}
    </div>
  )
}
