const BLOCKED_KEYWORDS = [
  'claude',
  'anthropic',
  'gemini',
  'deepseek',
  'llama',
  'palm',
  'bard',
  'mistral',
  'mixtral',
  'falcon',
  'vicuna',
  'alpaca'
]

const ALLOWED_PATTERNS = [
  /^gpt-/i,
  /^chatgpt/i,
  /^o1/i,
  /^text-davinci/i,
  /^davinci/i
]

export function isAllowedModel(modelId: string): boolean {
  const lowerId = modelId.toLowerCase()
  
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerId.includes(keyword)) {
      return false
    }
  }
  
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(modelId)) {
      return true
    }
  }
  
  if (lowerId.includes('gpt')) {
    return true
  }
  
  return false
}

export function filterModels(models: Array<{ id: string }>): Array<{ id: string }> {
  return models.filter(model => isAllowedModel(model.id))
}

export function sortModels(models: Array<{ id: string }>): Array<{ id: string }> {
  const priority = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1']
  
  return [...models].sort((a, b) => {
    const aIndex = priority.findIndex(p => a.id.startsWith(p))
    const bIndex = priority.findIndex(p => b.id.startsWith(p))
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    return a.id.localeCompare(b.id)
  })
}
