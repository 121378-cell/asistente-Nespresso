import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

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
