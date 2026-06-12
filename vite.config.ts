import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// The Euras EED API does not send CORS headers, so direct browser fetch is blocked.
// We proxy /eed-proxy/* through the Vite dev server so the request appears same-origin.
// In production (Vercel), vercel.json rewrites handle the same proxy logic.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/eed-proxy': {
        target: 'https://shop.euras.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/eed-proxy/, ''),
        configure: (proxy) => {
          // Pass a browser-like User-Agent so the Euras server doesn't block the request
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader(
              'User-Agent',
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            proxyReq.setHeader('Accept', 'application/json, text/plain, */*')
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9')
          })
        },
      },
    },
  },
})
