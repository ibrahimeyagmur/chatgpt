import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ChatPage } from '@/pages/ChatPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <ChatPage />
      },
      {
        path: 'c/:chatId',
        element: <ChatPage />
      }
    ]
  }
])
