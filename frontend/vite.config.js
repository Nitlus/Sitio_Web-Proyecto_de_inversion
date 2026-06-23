import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true, // ✨ Esto permite que cualquier túnel funcione sin bloquearlo
  }
})