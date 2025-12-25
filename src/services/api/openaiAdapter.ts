import { apiRequest } from './client'
import { filterModels, sortModels } from './modelFilter'

export interface Model {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface ModelsResponse {
  data: Model[]
  object: string
}

export async function fetchModels(): Promise<Model[]> {
  const response = await apiRequest<ModelsResponse>('/v1/models')
  const chatModels = response.data.filter(m => 
    m.id.includes('gpt') || m.id.startsWith('o1')
  )
  const filtered = filterModels(chatModels)
  return sortModels(filtered) as Model[]
}

export function formatMessagesForApi(
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    attachments?: Array<{ type: string; data: string; name: string }>
  }>
): Array<{
  role: string
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}> {
  return messages.map(msg => {
    if (msg.attachments && msg.attachments.length > 0) {
      const imageAttachments = msg.attachments.filter(a => a.type.startsWith('image/'))
      
      if (imageAttachments.length > 0) {
        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          { type: 'text', text: msg.content }
        ]
        
        for (const img of imageAttachments) {
          content.push({
            type: 'image_url',
            image_url: { url: img.data }
          })
        }
        
        return { role: msg.role, content }
      }
    }
    
    return { role: msg.role, content: msg.content }
  })
}

export function generateChatTitle(firstMessage: string): string {
  const cleaned = firstMessage
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  const words = cleaned.split(' ')
  const titleWords = words.slice(0, 6)
  let title = titleWords.join(' ')
  
  if (words.length > 6) {
    title += '...'
  }
  
  if (title.length > 50) {
    title = title.substring(0, 47) + '...'
  }
  
  return title || 'Yeni sohbet'
}
