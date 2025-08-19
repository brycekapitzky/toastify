import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'components/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'hooks/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'utils/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.{js,ts}',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, './components'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
    },
  },
})