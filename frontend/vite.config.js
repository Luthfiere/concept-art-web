import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { plugin } from 'postcss'

// https://vite.dev/config/
export default {
  plugins: [
    react()
  ],
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
      protocol: 'wss',
      host: 'www.kalaxel.site',
    },
    proxy: {
      // Proxy API and asset requests to backend in development
      '/api': 'http://localhost:5000/',
      '/assets': 'http://localhost:5000/'
    }
  }
}