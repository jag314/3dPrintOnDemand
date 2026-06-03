import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      three: path.resolve('./node_modules/three'),
    },
    dedupe: ['three', 'react', 'react-dom', '@react-three/fiber', '@react-three/drei'],
  },
  server: {
    // Proxy all /api/* requests to the Express server in development.
    // In production, set VITE_API_URL to the deployed API origin instead.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
