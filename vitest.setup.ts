import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Setup MSW (Mock Service Worker) - will add handlers later
// import { server } from './__tests__/mocks/server'
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

console.log('✓ Vitest setup complete')

