import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/download_stats/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});