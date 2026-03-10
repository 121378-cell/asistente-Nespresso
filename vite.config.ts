import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isAnalyze = mode === 'analyze';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: {
        host: '127.0.0.1',
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
        manifest: {
          name: 'Asistente Nespresso Professional',
          short_name: 'Nespresso AI',
          description: 'Asistente inteligente para técnicos de Nespresso Professional',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                },
              },
            },
          ],
        },
      }),
      ...(isAnalyze ? [visualizer({ open: true, filename: 'dist/stats.html' })] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks - React ecosystem
            'react-vendor': ['react', 'react-dom'],
            'react-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],

            // Large components
            modals: [
              './components/VideoGeneratorModal',
              './components/SavedRepairsModal',
              './components/DatabaseDashboard',
              './components/CameraIdentificationModal',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './tests/setup.ts',
      include: ['tests/**/*.test.ts'],
      exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        thresholds: {
          lines: 75,
          statements: 75,
          functions: 70,
          branches: 55,
        },
      },
    },
  };
});
