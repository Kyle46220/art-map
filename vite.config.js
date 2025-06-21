import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/proxy': {
        target: 'https://images.saatchiart.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      },
    },
  },
}) 