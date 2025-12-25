import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { fetchModels, type Model } from '@/services/api/openaiAdapter'
import { useSettingsStore } from '@/state/settingsStore'

interface ModelSelectProps {
  value: string
  onChange: (modelId: string) => void
}

export function ModelSelect({ value, onChange }: ModelSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { hasApiKey } = useSettingsStore()

  useEffect(() => {
    const loadModels = async () => {
      if (!hasApiKey()) {
        setModels([])
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const fetchedModels = await fetchModels()
        setModels(fetchedModels)
        
        if (fetchedModels.length > 0 && !fetchedModels.find(m => m.id === value)) {
          onChange(fetchedModels[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Modeller yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    
    loadModels()
  }, [hasApiKey()])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selectedModel = models.find(m => m.id === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || !hasApiKey()}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-chat-hover text-chat-text",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span className="text-sm font-medium">
            {selectedModel?.id || value || 'Model seç'}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && models.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-chat-sidebar border border-chat-border rounded-lg shadow-xl z-50 animate-fade-in">
          {error && (
            <div className="px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => {
                onChange(model.id)
                setIsOpen(false)
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-left",
                "hover:bg-chat-hover transition-colors",
                model.id === value && "bg-chat-hover"
              )}
            >
              <span className="text-sm text-chat-text truncate">{model.id}</span>
              {model.id === value && <Check className="w-4 h-4 text-chat-accent flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
