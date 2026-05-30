import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: ['chrome87', 'firefox78', 'safari14', 'edge88'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'safari14',
    },
  },
  test: {
    environment: 'node',
  },
})
