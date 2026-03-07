import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use cross-env APP=client or APP=admin to switch context
  const app = process.env.APP || 'client';
  const appRoot = resolve(__dirname, app);

  // Load env file based on `mode` in the app directory.
  const env = loadEnv(mode, appRoot, '');

  return {
    root: appRoot, // Set root to client/ or admin/ folder
    publicDir: resolve(__dirname, 'public'), // Point to shared public folder at root
    envDir: appRoot, // Load .env from client/ or admin/
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@client': resolve(__dirname, 'client/src'),
        '@admin': resolve(__dirname, 'admin/src'),
        '@shared': resolve(__dirname, 'shared'),
      },
    },
    build: {
      outDir: 'dist', // Output to client/dist
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(appRoot, 'index.html'),
      },
    },
    server: {
      port: app === 'admin' ? 5174 : 5173, // Default port 5173 for client, 5174 for admin
      strictPort: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
        '@tiptap/react',
        '@tiptap/starter-kit',
        'i18next',
        'react-i18next',
        'i18next-browser-languagedetector',
        'i18next-http-backend',
        'react-hot-toast'
      ],
    },
  }
})
