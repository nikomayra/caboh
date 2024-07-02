import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cabo-e6au.onrender.com',
        changeOrigin: true,
      },
    },
    historyApiFallback: true,
  },
});

//http://localhost:3001
