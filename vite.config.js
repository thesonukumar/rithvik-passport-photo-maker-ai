import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' }), // High efficiency compression
    viteCompression({ algorithm: 'gzip' }) // Fallback for older browsers
  ],
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
    include: ['pdfjs-dist']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  }
})