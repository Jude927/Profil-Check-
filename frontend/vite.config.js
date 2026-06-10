import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le proxy redirige tous les appels /api → http://localhost:8080
// Évite les problèmes CORS en développement
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
