import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { SettingsModal } from '@/components/modals/SettingsModal'
import { RenameChatModal } from '@/components/modals/RenameChatModal'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { ShareModal } from '@/components/modals/ShareModal'
import { useChatStore } from '@/state/chatStore'
import { useUIStore } from '@/state/uiStore'
import { useSettingsStore } from '@/state/settingsStore'

export function AppShell() {
  const navigate = useNavigate()
  
  const { chats, messages, loadChats, deleteChat, renameChat } = useChatStore()
  const { loadUIState, setIsMobile } = useUIStore()
  const { loadSettings } = useSettingsStore()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareTargetId, setShareTargetId] = useState<string | null>(null)

  useEffect(() => {
    loadChats()
    loadUIState()
    loadSettings()
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [loadChats, loadUIState, loadSettings, setIsMobile])

  const handleRenameChat = (chatId: string) => {
    setRenameTargetId(chatId)
    setRenameModalOpen(true)
  }

  const handleDeleteChat = (chatId: string) => {
    setDeleteTargetId(chatId)
    setDeleteDialogOpen(true)
  }

  const handleShareChat = (chatId: string) => {
    setShareTargetId(chatId)
    setShareModalOpen(true)
  }

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteChat(deleteTargetId)
      navigate('/')
    }
  }

  const confirmRename = (newTitle: string) => {
    if (renameTargetId) {
      renameChat(renameTargetId, newTitle)
    }
  }

  const renameTargetChat = chats.find(c => c.id === renameTargetId)
  const shareTargetChat = chats.find(c => c.id === shareTargetId)
  const shareTargetMessages = shareTargetId ? (messages[shareTargetId] || []) : []

  return (
    <div className="flex h-screen bg-chat-bg">
      <Sidebar
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onShareChat={handleShareChat}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      <SettingsModal />

      <RenameChatModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false)
          setRenameTargetId(null)
        }}
        currentTitle={renameTargetChat?.title || ''}
        onRename={confirmRename}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeleteTargetId(null)
        }}
        onConfirm={confirmDelete}
        title="Sohbeti Sil"
        message="Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false)
          setShareTargetId(null)
        }}
        chat={shareTargetChat || null}
        messages={shareTargetMessages}
      />
    </div>
  )
}
