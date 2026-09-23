import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Works both locally (with vite.config.local.ts) and on Vercel/CI (no env vars needed)
const port = Number(process.env.PORT ?? 3000);
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // Replit-specific plugins only when REPL_ID is set (never on Vercel)
    ...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID
      ? [
          await import('@replit/vite-plugin-runtime-error-modal').then(m => m.default()),
          await import('@replit/vite-plugin-cartographer').then(m =>
            m.cartographer({ root: path.resolve(import.meta.dirname, '..') })
          ),
          await import('@replit/vite-plugin-dev-banner').then(m => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port: isNaN(port) ? 3000 : port,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: { strict: false, allow: [path.resolve(import.meta.dirname, '../..')] },
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  preview: {
    port: isNaN(port) ? 3000 : port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
