import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Prefer loadEnv value, fall back to process.env (Render sets these at build time)
  const get = (key) => env[key] || process.env[key] || ''

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000,
    },
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(get('VITE_GROQ_API_KEY')),
    },
  }
})
