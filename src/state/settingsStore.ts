import { create } from 'zustand'
import { storage, STORAGE_KEYS } from '@/services/storage'

interface Settings {
  apiKey: string
  baseUrl: string
  lastSelectedModelId: string
}

interface SettingsState {
  settings: Settings
  isSettingsOpen: boolean
  loadSettings: () => void
  saveSettings: (settings: Partial<Settings>) => void
  openSettings: () => void
  closeSettings: () => void
  hasApiKey: () => boolean
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: '',
  lastSelectedModelId: 'gpt-4o'
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isSettingsOpen: false,
  
  loadSettings: () => {
    const saved = storage.get<Settings>(STORAGE_KEYS.SETTINGS)
    if (saved) {
      set({ settings: { ...DEFAULT_SETTINGS, ...saved } })
    }
  },
  
  saveSettings: (newSettings) => {
    const current = get().settings
    const updated = { ...current, ...newSettings }
    storage.set(STORAGE_KEYS.SETTINGS, updated)
    set({ settings: updated })
  },
  
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  
  hasApiKey: () => {
    return get().settings.apiKey.trim().length > 0
  }
}))
