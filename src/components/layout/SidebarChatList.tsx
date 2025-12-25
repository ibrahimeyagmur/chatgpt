import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Pin, Share2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { groupByDate } from '@/utils/date'
import type { Chat } from '@/state/chatStore'

interface SidebarChatListProps {
  chats: Chat[]
  collapsed: boolean
  onRename: (chatId: string) => void
  onDelete: (chatId: string) => void
  onPin: (chatId: string) => void
  onShare: (chatId: string) => void
}

export function SidebarChatList({ chats, collapsed, onRename, onDelete, onPin, onShare }: SidebarChatListProps) {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpenId(null)
  }, [])

  useEffect(() => {
    if (!menuOpenId) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current && 
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeMenu()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpenId, closeMenu])

  if (collapsed) {
    return (
      <div className="flex-1 overflow-y-auto py-2">
        {chats.slice(0, 10).map((chat) => (
          <button
            key={chat.id}
            onClick={() => navigate(`/c/${chat.id}`)}
            className={cn(
              "w-full p-2 flex justify-center hover:bg-chat-hover rounded-lg transition-colors mx-auto",
              chat.id === chatId && "bg-chat-hover"
            )}
            title={chat.title}
          >
            <MessageSquare className="w-5 h-5 text-chat-text-secondary" />
          </button>
        ))}
      </div>
    )
  }

  const grouped = groupByDate(chats)
  const groupOrder = ['Bugün', 'Dün', 'Son 7 gün', 'Son 30 gün', 'Daha eski']

  return (
    <div className="flex-1 overflow-y-auto">
      {groupOrder.map((group) => {
        const groupChats = grouped[group]
        if (!groupChats || groupChats.length === 0) return null

        return (
          <div key={group} className="mb-4">
            <div className="px-3 py-2 text-xs font-medium text-chat-text-secondary">
              {group}
            </div>
            {groupChats.map((chat) => {
              const isMenuOpen = menuOpenId === chat.id
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative mx-2 rounded-lg transition-colors",
                    chat.id === chatId || isMenuOpen ? "bg-chat-hover" : "hover:bg-chat-hover"
                  )}
                >
                  <button
                    onClick={() => navigate(`/c/${chat.id}`)}
                    className="w-full text-left px-3 py-2.5 pr-10"
                  >
                    <div className="flex items-center gap-2">
                      {chat.pinned && <Pin className="w-3 h-3 text-chat-accent flex-shrink-0" />}
                      <span className="text-sm text-chat-text truncate">{chat.title}</span>
                    </div>
                  </button>

                  <div className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 transition-opacity",
                    isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <button
                      ref={isMenuOpen ? triggerRef : undefined}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isMenuOpen) {
                          setMenuOpenId(null)
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuPosition({
                            top: rect.bottom + 4,
                            left: Math.min(rect.right - 192, window.innerWidth - 200)
                          })
                          setMenuOpenId(chat.id)
                        }
                      }}
                      className={cn(
                        "p-1 rounded transition-colors",
                        isMenuOpen ? "bg-chat-border" : "hover:bg-chat-border"
                      )}
                    >
                      <MoreHorizontal className="w-4 h-4 text-chat-text-secondary" />
                    </button>
                  </div>

                  {isMenuOpen && createPortal(
                    <div
                      ref={menuRef}
                      style={{ top: menuPosition.top, left: menuPosition.left }}
                      className="fixed w-48 bg-chat-sidebar border border-chat-border rounded-lg shadow-2xl z-[200] py-1 animate-fade-in"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRename(chat.id)
                          closeMenu()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-chat-text hover:bg-chat-hover transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Yeniden adlandır</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onPin(chat.id)
                          closeMenu()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-chat-text hover:bg-chat-hover transition-colors"
                      >
                        <Pin className="w-4 h-4" />
                        <span>{chat.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onShare(chat.id)
                          closeMenu()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-chat-text hover:bg-chat-hover transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Paylaş</span>
                      </button>
                      <div className="border-t border-chat-border my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(chat.id)
                          closeMenu()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-chat-hover transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Sil</span>
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
