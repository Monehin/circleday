import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup mock server for Node environment (unit/integration tests)
export const server = setupServer(...handlers)

