import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://mongrel-underfed-upwind.ngrok-free.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'), 
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
