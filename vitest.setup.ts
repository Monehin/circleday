import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import * as React from 'react'

// Minimal act shim for React 19 tests
const actShim = async (callback: () => any) => {
  return await callback()
}

// Mock react-dom/test-utils to supply act
vi.mock('react-dom/test-utils', () => ({
  act: actShim,
}))

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
if (!(globalThis as any).act) {
  ;(globalThis as any).act = actShim
}
if (!(React as any).act) {
  try {
    Object.defineProperty(React, 'act', { value: actShim, writable: true })
  } catch {
    // ignore if already defined/non-configurable
  }
}
;(globalThis as any).React = React

// Setup MSW (Mock Service Worker) - will add handlers later
// import { server } from './__tests__/mocks/server'
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

console.log('✓ Vitest setup complete')

