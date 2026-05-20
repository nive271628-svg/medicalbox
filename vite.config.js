import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Helper: prefer loadEnv value, fall back to process.env (Render sets these at build time)
  const get = (key) => env[key] || process.env[key] || ''

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000,
    },
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY':            JSON.stringify(get('VITE_FIREBASE_API_KEY')),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN':        JSON.stringify(get('VITE_FIREBASE_AUTH_DOMAIN')),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID':         JSON.stringify(get('VITE_FIREBASE_PROJECT_ID')),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET':     JSON.stringify(get('VITE_FIREBASE_STORAGE_BUCKET')),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID':JSON.stringify(get('VITE_FIREBASE_MESSAGING_SENDER_ID')),
      'import.meta.env.VITE_FIREBASE_APP_ID':             JSON.stringify(get('VITE_FIREBASE_APP_ID')),
      'import.meta.env.VITE_OPENROUTER_API_KEY':          JSON.stringify(get('VITE_OPENROUTER_API_KEY')),
      'import.meta.env.VITE_GROQ_API_KEY':               JSON.stringify(get('VITE_GROQ_API_KEY')),
    },
  }
})
