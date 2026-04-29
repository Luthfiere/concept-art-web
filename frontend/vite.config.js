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
      '5c26-103-3-222-219.ngrok-free.app',  // Your ngrok URL
      '.ngrok-free.app',  // Allow all ngrok subdomains
      'localhost',
      '127.0.0.1'
    ],
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    proxy: {
      // Optional: Proxy API requests in development
      '/api': 'http://localhost:5000/'
    }
  }
}