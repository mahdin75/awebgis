import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Check for the environment mode
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: isProduction
            ? 'https://admin.chainy.app' // Production backend URL
            : 'https://dev-admin.chainy.app',  // Development backend URL
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        '/geoserver': {
          target: isProduction
            ? 'https://admin.chainy.app' // Production geoserver URL
            : 'https://dev-admin.chainy.app',  // Development geoserver URL
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/geoserver/, '/geoserver/'),
        },
      },
    },
  };
});
