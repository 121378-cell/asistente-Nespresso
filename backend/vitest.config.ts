import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', 'prisma/**', '**/*.config.ts', '**/*.d.ts'],
      thresholds: {
        lines: 50,
        statements: 50,
        functions: 45,
        branches: 40,
      },
    },
  },
});
