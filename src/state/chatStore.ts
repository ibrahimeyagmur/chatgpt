import { create } from 'zustand'
import { storage, STORAGE_KEYS } from '@/services/storage'
import { generateId } from '@/utils/id'
import { generateChatTitle, formatMessagesForApi } from '@/services/api/openaiAdapter'
import { streamCompletion } from '@/services/api/stream'

export interface Attachment {
  type: string
  data: string
  name: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
  attachments?: Attachment[]
}

export interface Chat {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  pinned?: boolean
}

interface MessagesStore {
  [chatId: string]: Message[]
}

interface ChatState {
  chats: Chat[]
  messages: MessagesStore
  currentChatId: string | null
  isStreaming: boolean
  streamingContent: string
  abortController: AbortController | null
  
  loadChats: () => void
  createChat: () => string
  deleteChat: (chatId: string) => void
  renameChat: (chatId: string, title: string) => void
  togglePinChat: (chatId: string) => void
  setCurrentChat: (chatId: string | null) => void
  
  getCurrentMessages: () => Message[]
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'createdAt'>) => Message
  updateMessage: (chatId: string, messageId: string, content: string) => void
  deleteMessage: (chatId: string, messageId: string) => void
  
  sendMessage: (chatId: string, content: string, model: string, attachments?: Attachment[]) => Promise<void>
  regenerateResponse: (chatId: string, model: string) => Promise<void>
  editAndResend: (chatId: string, messageId: string, newContent: string, model: string) => Promise<void>
  stopStreaming: () => void
  
  searchChats: (query: string) => Chat[]
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  currentChatId: null,
  isStreaming: false,
  streamingContent: '',
  abortController: null,
  
  loadChats: () => {
    const savedChats = storage.get<Chat[]>(STORAGE_KEYS.CHATS)
    const savedMessages = storage.get<MessagesStore>(STORAGE_KEYS.MESSAGES)
    
    if (savedChats) {
      const sortedChats = [...savedChats].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return b.updatedAt - a.updatedAt
      })
      set({ chats: sortedChats })
    }
    
    if (savedMessages) {
      set({ messages: savedMessages })
    }
  },
  
  createChat: () => {
    const id = generateId()
    const now = Date.now()
    const newChat: Chat = {
      id,
      title: 'Yeni sohbet',
      createdAt: now,
      updatedAt: now
    }
    
    const { chats, messages } = get()
    const updatedChats = [newChat, ...chats]
    const updatedMessages = { ...messages, [id]: [] }
    
    set({ chats: updatedChats, messages: updatedMessages, currentChatId: id })
    storage.set(STORAGE_KEYS.CHATS, updatedChats)
    storage.set(STORAGE_KEYS.MESSAGES, updatedMessages)
    
    return id
  },
  
  deleteChat: (chatId) => {
    const { chats, messages, currentChatId } = get()
    const updatedChats = chats.filter(c => c.id !== chatId)
    const { [chatId]: _, ...updatedMessages } = messages
    
    set({
      chats: updatedChats,
      messages: updatedMessages,
      currentChatId: currentChatId === chatId ? null : currentChatId
    })
    
    storage.set(STORAGE_KEYS.CHATS, updatedChats)
    storage.set(STORAGE_KEYS.MESSAGES, updatedMessages)
  },
  
  renameChat: (chatId, title) => {
    const { chats } = get()
    const updatedChats = chats.map(c =>
      c.id === chatId ? { ...c, title, updatedAt: Date.now() } : c
    )
    
    set({ chats: updatedChats })
    storage.set(STORAGE_KEYS.CHATS, updatedChats)
  },
  
  togglePinChat: (chatId) => {
    const { chats } = get()
    const updatedChats = chats.map(c =>
      c.id === chatId ? { ...c, pinned: !c.pinned, updatedAt: Date.now() } : c
    ).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.updatedAt - a.updatedAt
    })
    
    set({ chats: updatedChats })
    storage.set(STORAGE_KEYS.CHATS, updatedChats)
  },
  
  setCurrentChat: (chatId) => {
    set({ currentChatId: chatId })
  },
  
  getCurrentMessages: () => {
    const { currentChatId, messages } = get()
    if (!currentChatId) return []
    return messages[currentChatId] || []
  },
  
  addMessage: (chatId, messageData) => {
    const { messages, chats } = get()
    const message: Message = {
      ...messageData,
      id: generateId(),
      createdAt: Date.now()
    }
    
    const chatMessages = messages[chatId] || []
    const updatedMessages = {
      ...messages,
      [chatId]: [...chatMessages, message]
    }
    
    const updatedChats = chats.map(c =>
      c.id === chatId ? { ...c, updatedAt: Date.now() } : c
    ).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.updatedAt - a.updatedAt
    })
    
    set({ messages: updatedMessages, chats: updatedChats })
    storage.set(STORAGE_KEYS.MESSAGES, updatedMessages)
    storage.set(STORAGE_KEYS.CHATS, updatedChats)
    
    return message
  },
  
  updateMessage: (chatId, messageId, content) => {
    const { messages } = get()
    const chatMessages = messages[chatId] || []
    const updatedChatMessages = chatMessages.map(m =>
      m.id === messageId ? { ...m, content } : m
    )
    
    const updatedMessages = { ...messages, [chatId]: updatedChatMessages }
    set({ messages: updatedMessages })
    storage.set(STORAGE_KEYS.MESSAGES, updatedMessages)
  },
  
  deleteMessage: (chatId, messageId) => {
    const { messages } = get()
    const chatMessages = messages[chatId] || []
    const updatedChatMessages = chatMessages.filter(m => m.id !== messageId)
    
    const updatedMessages = { ...messages, [chatId]: updatedChatMessages }
    set({ messages: updatedMessages })
    storage.set(STORAGE_KEYS.MESSAGES, updatedMessages)
  },
  
  sendMessage: async (chatId, content, model, attachments) => {
    const { addMessage, messages, chats } = get()
    
    addMessage(chatId, {
      role: 'user',
      content,
      attachments
    })
    
    const currentChat = chats.find(c => c.id === chatId)
    const chatMessages = messages[chatId] || []
    
    if (chatMessages.length === 0 && currentChat?.title === 'Yeni sohbet') {
      const title = generateChatTitle(content)
      get().renameChat(chatId, title)
    }
    
    const updatedMessages = get().messages[chatId] || []
    const apiMessages = formatMessagesForApi(updatedMessages)
    
    const abortController = new AbortController()
    set({ isStreaming: true, streamingContent: '', abortController })
    
    const assistantMessage = addMessage(chatId, {
      role: 'assistant',
      content: ''
    })
    
    let fullContent = ''
    
    await streamCompletion({
      model,
      messages: apiMessages,
      signal: abortController.signal,
      onToken: (token) => {
        fullContent += token
        set({ streamingContent: fullContent })
        get().updateMessage(chatId, assistantMessage.id, fullContent)
      },
      onComplete: () => {
        set({ isStreaming: false, streamingContent: '', abortController: null })
      },
      onError: (error) => {
        get().updateMessage(chatId, assistantMessage.id, `Hata: ${error.message}`)
        set({ isStreaming: false, streamingContent: '', abortController: null })
      }
    })
  },
  
  regenerateResponse: async (chatId, model) => {
    const { messages, deleteMessage, sendMessage } = get()
    const chatMessages = messages[chatId] || []
    
    const lastAssistantIndex = chatMessages.findLastIndex(m => m.role === 'assistant')
    if (lastAssistantIndex === -1) return
    
    const lastAssistant = chatMessages[lastAssistantIndex]
    deleteMessage(chatId, lastAssistant.id)
    
    const lastUserIndex = chatMessages.findLastIndex((m, i) => m.role === 'user' && i < lastAssistantIndex)
    if (lastUserIndex === -1) return
    
    const lastUser = chatMessages[lastUserIndex]
    deleteMessage(chatId, lastUser.id)
    
    await sendMessage(chatId, lastUser.content, model, lastUser.attachments)
  },
  
  editAndResend: async (chatId, messageId, newContent, model) => {
    const { messages, deleteMessage, sendMessage } = get()
    const chatMessages = messages[chatId] || []
    
    const messageIndex = chatMessages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    const originalMessage = chatMessages[messageIndex]
    
    const messagesToDelete = chatMessages.slice(messageIndex).map(m => m.id)
    for (const id of messagesToDelete) {
      deleteMessage(chatId, id)
    }
    
    await sendMessage(chatId, newContent, model, originalMessage.attachments)
  },
  
  stopStreaming: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
    }
    set({ isStreaming: false, streamingContent: '', abortController: null })
  },
  
  searchChats: (query) => {
    const { chats, messages } = get()
    const lowerQuery = query.toLowerCase()
    
    return chats.filter(chat => {
      if (chat.title.toLowerCase().includes(lowerQuery)) return true
      
      const chatMessages = messages[chat.id] || []
      return chatMessages.some(m =>
        m.content.toLowerCase().includes(lowerQuery)
      )
    })
  }
}))
