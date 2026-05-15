import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/widget.js`,
        chunkFileNames: `assets/widget-chunk.js`,
        assetFileNames: `assets/widget.[ext]`
      }
    }
  }
})
