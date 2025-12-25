import { create } from 'zustand'
import { storage, STORAGE_KEYS } from '@/services/storage'

interface UIState {
  sidebarCollapsed: boolean
  sidebarOpenMobile: boolean
  isMobile: boolean
  loadUIState: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarOpenMobile: (open: boolean) => void
  setIsMobile: (isMobile: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  sidebarOpenMobile: false,
  isMobile: false,
  
  loadUIState: () => {
    const saved = storage.get<{ sidebarCollapsed: boolean }>(STORAGE_KEYS.UI_STATE)
    const cookieValue = storage.cookie.get('sidebar_collapsed')
    
    if (saved) {
      set({ sidebarCollapsed: saved.sidebarCollapsed })
    } else if (cookieValue) {
      set({ sidebarCollapsed: cookieValue === 'true' })
    }
  },
  
  toggleSidebar: () => {
    const { isMobile, sidebarCollapsed, sidebarOpenMobile } = get()
    
    if (isMobile) {
      set({ sidebarOpenMobile: !sidebarOpenMobile })
    } else {
      const newCollapsed = !sidebarCollapsed
      set({ sidebarCollapsed: newCollapsed })
      storage.set(STORAGE_KEYS.UI_STATE, { sidebarCollapsed: newCollapsed })
      storage.cookie.set('sidebar_collapsed', String(newCollapsed))
    }
  },
  
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
    storage.set(STORAGE_KEYS.UI_STATE, { sidebarCollapsed: collapsed })
    storage.cookie.set('sidebar_collapsed', String(collapsed))
  },
  
  setSidebarOpenMobile: (open) => {
    set({ sidebarOpenMobile: open })
  },
  
  setIsMobile: (isMobile) => {
    set({ isMobile })
  }
}))
