const DEFAULT_BASE_URL = 'https://api.openai.com'

export function getApiConfig(): { baseUrl: string; apiKey: string | null } {
  const settings = localStorage.getItem('chatgpt_settings')
  if (!settings) {
    return { baseUrl: DEFAULT_BASE_URL, apiKey: null }
  }
  
  try {
    const parsed = JSON.parse(settings)
    return {
      baseUrl: parsed.baseUrl?.trim() || DEFAULT_BASE_URL,
      apiKey: parsed.apiKey || null
    }
  } catch {
    return { baseUrl: DEFAULT_BASE_URL, apiKey: null }
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { baseUrl, apiKey } = getApiConfig()
  
  if (!apiKey) {
    throw new Error('API anahtarı gerekli')
  }
  
  const url = `${baseUrl}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}
