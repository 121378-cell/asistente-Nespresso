import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isAnalyze = mode === 'analyze';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      ...(isAnalyze ? [visualizer({ open: true, filename: 'dist/stats.html' })] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks - React ecosystem
            'react-vendor': ['react', 'react-dom'],
            'react-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],

            // Large components
            'modals': [
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
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});
