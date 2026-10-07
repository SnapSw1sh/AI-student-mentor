import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // В корне лежат чужие HTML-страницы (админка db-svc, клон фронта для nginx, legacy).
  // Без явного входа Vite сканирует их при старте и спотыкается о пути, которые
  // разрешаются только внутри самих этих приложений.
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    watch: {
      ignored: ['**/backend-con/**', '**/legacy/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        ws: true,
      },
      // Админ-панель db-svc отдаёт nginx; без этого в dev-режиме /admin/ попадал бы в SPA.
      '/admin': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
});
