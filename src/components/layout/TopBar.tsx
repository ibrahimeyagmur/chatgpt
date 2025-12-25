import { Menu, Share2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ModelSelect } from '@/components/chat/ModelSelect'
import { useUIStore } from '@/state/uiStore'

interface TopBarProps {
  selectedModel: string
  onModelChange: (model: string) => void
  onShare: () => void
  hasMessages: boolean
}

export function TopBar({ selectedModel, onModelChange, onShare, hasMessages }: TopBarProps) {
  const { isMobile, sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-chat-border bg-chat-bg">
      <div className="flex items-center gap-2">
        {(isMobile || sidebarCollapsed) && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <ModelSelect value={selectedModel} onChange={onModelChange} />
      </div>

      <div className="flex items-center gap-2">
        {hasMessages && (
          <button
            onClick={onShare}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              "hover:bg-chat-hover text-chat-text-secondary hover:text-chat-text"
            )}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Paylaş</span>
          </button>
        )}
      </div>
    </div>
  )
}
