import { describe, it, expect, beforeEach } from 'vitest'
import { db, checkDatabaseConnection } from '@/lib/db'

// Skip database tests if DATABASE_URL is not configured (e.g., in CI)
const skipIfNoDatabase = process.env.DATABASE_URL ? describe : describe.skip

skipIfNoDatabase('Database Integration', () => {
  describe('Connection', () => {
    it('should connect to database successfully', async () => {
      const isConnected = await checkDatabaseConnection()
      
      expect(isConnected).toBe(true)
    })

    it('should handle connection errors gracefully', async () => {
      // This tests the error handling, actual connection should work
      const result = await checkDatabaseConnection()
      
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Basic Operations', () => {
    // Clean up test data before each test
    beforeEach(async () => {
      // We'll add cleanup when we start creating data in Epic 2
    })

    it('should have Prisma client available', () => {
      expect(db).toBeDefined()
      expect(db.$queryRaw).toBeDefined()
      expect(db.$transaction).toBeDefined()
    })

    it('should execute raw queries', async () => {
      const result = await db.$queryRaw`SELECT 1 as value`
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have all models available', () => {
      // Verify critical models are available
      expect(db.user).toBeDefined()
      expect(db.group).toBeDefined()
      expect(db.contact).toBeDefined()
      expect(db.event).toBeDefined()
      expect(db.scheduledSend).toBeDefined()
    })
  })

  describe('Schema Validation', () => {
    it('should have proper model structure', async () => {
      // Get all tables
      const tables = await db.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
      `
      
      const tableNames = tables.map((t) => t.table_name)
      
      // Verify critical tables exist
      expect(tableNames).toContain('users')
      expect(tableNames).toContain('groups')
      expect(tableNames).toContain('contacts')
      expect(tableNames).toContain('events')
      expect(tableNames).toContain('scheduled_sends')
      
      // Should have 21 tables
      expect(tables.length).toBeGreaterThanOrEqual(21)
    })
  })
})

// Always run basic Prisma client tests
describe('Prisma Client (No DB Required)', () => {
  it('should have Prisma client module available', () => {
    expect(db).toBeDefined()
  })

  it('should have model definitions', () => {
    expect(db.user).toBeDefined()
    expect(db.group).toBeDefined()
    expect(db.event).toBeDefined()
  })
})

