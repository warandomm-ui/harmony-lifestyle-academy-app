import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['services/**', 'utils/**', 'contexts/**', 'components/**'],
      exclude: ['**/*.test.{ts,tsx}', 'test/**'],
      // Deliberately low starting floor — ratchet upward as coverage lands.
      // See TESTING_STRATEGY.md for the phased plan.
      thresholds: {
        lines: 2,
        functions: 2,
        branches: 30,
        statements: 2,
      },
    },
  },
});
