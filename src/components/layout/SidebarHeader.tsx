import { PanelLeftClose, PanelLeft, SquarePen, X } from 'lucide-react'
import { useUIStore } from '@/state/uiStore'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
  onNewChat: () => void
}

export function SidebarHeader({ collapsed, onToggle, onNewChat }: SidebarHeaderProps) {
  const { isMobile, setSidebarOpenMobile } = useUIStore()

  return (
    <div className="flex items-center justify-between p-2">
      {isMobile ? (
        <button
          onClick={() => setSidebarOpenMobile(false)}
          className="p-2 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={onToggle}
          className="p-2 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          title={collapsed ? "Kenar çubuğunu aç" : "Kenar çubuğunu kapat"}
        >
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      )}
      
      {!collapsed && (
        <button
          onClick={onNewChat}
          className="p-2 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          title="Yeni sohbet"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
