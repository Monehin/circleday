import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGroup, getGroups, getGroupById, updateGroup, addMember } from '@/lib/actions/groups'

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

// Mock auth
vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    $transaction: vi.fn(),
    group: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    contact: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    membership: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

describe('Groups Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createGroup', () => {
    it('should return error if user is not authenticated', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await createGroup({ name: 'Test Group', type: 'PERSONAL' })

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should return error for invalid input', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      const result = await createGroup({ name: 'A', type: 'PERSONAL' }) // Too short

      expect(result.error).toBeDefined()
    })

    it('should create group with owner contact and membership', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test User' },
      } as any)

      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        ownerId: 'user-1',
        defaultTimezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.$transaction).mockImplementationOnce(async (callback: any) => {
        return callback({
          group: {
            create: vi.fn().mockResolvedValueOnce(mockGroup),
          },
          contact: {
            upsert: vi.fn().mockResolvedValueOnce({ id: 'contact-1' }),
          },
          membership: {
            create: vi.fn().mockResolvedValueOnce({}),
          },
          auditLog: {
            create: vi.fn().mockResolvedValueOnce({}),
          },
        })
      })

      const result = await createGroup({ name: 'Test Group', type: 'PERSONAL' })

      expect(result.success).toBe(true)
      expect(result.group).toBeDefined()
    })
  })

  describe('getGroups', () => {
    it('should return error if user is not authenticated', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await getGroups()

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should return user groups with member counts', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      vi.mocked(db.group.findMany).mockResolvedValueOnce([
        {
          id: 'group-1',
          name: 'Test Group',
          createdAt: new Date(),
          _count: { memberships: 3 },
        },
      ] as any)

      const result = await getGroups()

      expect(result.success).toBe(true)
      expect(result.groups).toHaveLength(1)
      expect(result.groups).toBeDefined()
      if (result.groups && result.groups.length > 0) {
        const firstGroup = result.groups[0]
        expect(firstGroup?.memberCount).toBe(3)
      }
    })
  })

  describe('addMember', () => {
    it('should return error if user is not authenticated', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await addMember({
        groupId: 'group-1',
        name: 'New Member',
        email: 'member@test.com',
        role: 'MEMBER',
      })

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should return error if user lacks permission', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      vi.mocked(db.membership.findFirst).mockResolvedValueOnce(null)

      const result = await addMember({
        groupId: 'group-1',
        name: 'New Member',
        email: 'member@test.com',
        role: 'MEMBER',
      })

      expect(result.error).toContain('permission')
    })

    it('should require either email or phone', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      const result = await addMember({
        groupId: 'group-1',
        name: 'New Member',
        role: 'MEMBER',
      })

      expect(result.error).toBeDefined()
    })
  })
})

