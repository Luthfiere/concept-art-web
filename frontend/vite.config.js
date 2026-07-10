import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'kalaxel.site',
      'www.kalaxel.site',
    ],
    host: true,
    port: 5175,
    strictPort: true,
    hmr: {
      protocol: process.env.NODE_ENV === 'production' ? 'wss' : 'ws',
      host: process.env.NODE_ENV === 'production' ? 'www.kalaxel.site' : 'localhost',
    },
    proxy: {
      '/api': 'http://localhost:5000/',
      '/assets': 'http://localhost:5000/'
    }
  }
})