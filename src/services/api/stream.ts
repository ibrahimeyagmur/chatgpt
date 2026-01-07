import { getApiConfig, resolveBaseUrl } from './client'

export interface StreamMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

export interface StreamOptions {
  model: string
  messages: StreamMessage[]
  onToken: (token: string) => void
  onComplete: () => void
  onError: (error: Error) => void
  signal?: AbortSignal
}

function buildRequestBody(model: string, messages: StreamMessage[]) {
  const isGpt5 = model.toLowerCase().includes('gpt-5')

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: true
  }

  if (!isGpt5) {
    body.temperature = 0.7
  }

  return body
}

export async function streamCompletion(options: StreamOptions): Promise<void> {
  const { model, messages, onToken, onComplete, onError, signal } = options
  const { baseUrl, apiKey } = getApiConfig()

  if (!apiKey) {
    onError(new Error('API anahtarı gerekli'))
    return
  }

  try {
    const finalBaseUrl = resolveBaseUrl(baseUrl)
    const response = await fetch(`${finalBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(buildRequestBody(model, messages)),
      signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Stream okunamadı')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onComplete()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6))
            const content = json.choices?.[0]?.delta?.content
            if (content) {
              onToken(content)
            }
          } catch {
            continue
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      onComplete()
      return
    }
    onError(error instanceof Error ? error : new Error('Bilinmeyen hata'))
  }
}
