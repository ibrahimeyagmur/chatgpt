import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    proxy: {
      '/api/loratech': {
        target: 'https://api.loratech.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/loratech/, '')
      }
    }
  }
})
