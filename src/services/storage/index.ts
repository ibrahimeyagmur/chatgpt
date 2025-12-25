import { getItem, setItem, removeItem } from './local'
import { setCookie, getCookie, deleteCookie } from './cookies'

export const storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
  cookie: {
    get: getCookie,
    set: setCookie,
    remove: deleteCookie
  }
}

export const STORAGE_KEYS = {
  SETTINGS: 'chatgpt_settings',
  CHATS: 'chatgpt_chats',
  MESSAGES: 'chatgpt_messages',
  UI_STATE: 'chatgpt_ui'
} as const
