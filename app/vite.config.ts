import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      includeAssets: [
        'manifest.webmanifest',
        'icons/pathimon-192.png',
        'icons/pathimon-512.png',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,webmanifest,png}'],
        globIgnores: ['audio/**/*', 'video/**/*', 'videos/**/*', 'images/**/*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
