import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://hiworld-bookstore.onrender.com',
        // target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    },
  },
});

