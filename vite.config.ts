import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente (es. API_KEY da Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Mappa la variabile API_KEY in modo che process.env.API_KEY funzioni nel codice
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})