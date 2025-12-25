import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useSettingsStore } from '@/state/settingsStore'

export function SettingsModal() {
  const { settings, isSettingsOpen, closeSettings, saveSettings } = useSettingsStore()
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    setApiKey(settings.apiKey)
    setBaseUrl(settings.baseUrl)
  }, [settings, isSettingsOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings()
    }
    
    if (isSettingsOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isSettingsOpen, closeSettings])

  const handleSave = () => {
    saveSettings({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim() })
    closeSettings()
  }

  if (!isSettingsOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closeSettings}
      />
      <div className="relative w-full max-w-md mx-4 bg-chat-sidebar border border-chat-border rounded-xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-chat-border">
          <h2 className="text-lg font-semibold text-chat-text">Ayarlar</h2>
          <button
            onClick={closeSettings}
            className="p-1 hover:bg-chat-hover rounded-lg transition-colors text-chat-text-secondary hover:text-chat-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-chat-text mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 pr-10 bg-chat-input-bg border border-chat-border rounded-lg text-chat-text placeholder-chat-text-secondary focus:outline-none focus:ring-2 focus:ring-chat-accent focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-chat-text-secondary hover:text-chat-text"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-chat-text mb-2">
              Base URL (opsiyonel)
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com"
              className="w-full px-3 py-2.5 bg-chat-input-bg border border-chat-border rounded-lg text-chat-text placeholder-chat-text-secondary focus:outline-none focus:ring-2 focus:ring-chat-accent focus:border-transparent"
            />
            <p className="mt-1.5 text-xs text-chat-text-secondary">
              Boş bırakılırsa varsayılan OpenAI API kullanılır
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-chat-border">
          <button
            onClick={closeSettings}
            className="px-4 py-2 text-sm text-chat-text-secondary hover:text-chat-text hover:bg-chat-hover rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "bg-chat-accent text-white hover:bg-chat-accent-hover"
            )}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
