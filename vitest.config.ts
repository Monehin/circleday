import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['__tests__/e2e/**', 'node_modules/**', '.next/**'],
    testTimeout: 20000, // 20 seconds for Temporal workflow tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.{ts,js}',
        'app/layout.tsx',
        '.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

