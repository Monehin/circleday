import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserProfile, updateUserProfile, getUserStats } from '@/lib/actions/profile'

// Mock dependencies
vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    membership: {
      count: vi.fn(),
    },
    event: {
      count: vi.fn(),
    },
    contact: {
      count: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'

describe('Profile Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await getUserProfile()

      expect(result.error).toBe('Unauthorized')
    })

    it('should return error if user not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      const result = await getUserProfile()

      expect(result.error).toBe('User not found')
    })

    it('should return user profile successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        defaultTimezone: 'America/New_York',
        phone: '+1234567890',
        phoneVerified: false,
        createdAt: new Date(),
      }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)

      const result = await getUserProfile()

      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockUser)
    })
  })

  describe('updateUserProfile', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await updateUserProfile({
        name: 'New Name',
        email: 'new@example.com',
        defaultTimezone: 'UTC',
      })

      expect(result.error).toBe('Unauthorized')
    })

    it('should return error if email is already taken', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.user.findFirst).mockResolvedValue({
        id: 'user-2', // Different user
        email: 'new@example.com',
      } as any)

      const result = await updateUserProfile({
        name: 'Test User',
        email: 'new@example.com',
        defaultTimezone: 'UTC',
      })

      expect(result.error).toBe('Email is already taken')
    })

    it('should update profile successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      // No existing user with new email
      vi.mocked(db.user.findFirst).mockResolvedValue(null)

      const mockUpdatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        email: 'updated@example.com',
        emailVerified: true,
        defaultTimezone: 'America/Los_Angeles',
        phone: '+1987654321',
        phoneVerified: false,
        createdAt: new Date(),
      }

      vi.mocked(db.user.update).mockResolvedValue(mockUpdatedUser as any)

      const result = await updateUserProfile({
        name: 'Updated Name',
        email: 'updated@example.com',
        defaultTimezone: 'America/Los_Angeles',
        phone: '+1987654321',
      })

      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockUpdatedUser)
    })

    it('should validate name length', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      const result = await updateUserProfile({
        name: '', // Empty name
        email: 'test@example.com',
        defaultTimezone: 'UTC',
      })

      expect(result.error).toContain('Name is required')
    })

    it('should validate email format', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      const result = await updateUserProfile({
        name: 'Test User',
        email: 'invalid-email', // Invalid email
        defaultTimezone: 'UTC',
      })

      expect(result.error).toContain('Invalid email')
    })

    it('should allow updating to same email', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      const mockUpdatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        email: 'test@example.com', // Same email
        emailVerified: true,
        defaultTimezone: 'UTC',
        phone: null,
        phoneVerified: false,
        createdAt: new Date(),
      }

      vi.mocked(db.user.update).mockResolvedValue(mockUpdatedUser as any)

      const result = await updateUserProfile({
        name: 'Updated Name',
        email: 'test@example.com',
        defaultTimezone: 'UTC',
      })

      expect(result.success).toBe(true)
      expect(db.user.findFirst).not.toHaveBeenCalled() // Should not check for duplicate
    })
  })

  describe('getUserStats', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await getUserStats()

      expect(result.error).toBe('Unauthorized')
    })

    it('should return user stats successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.count).mockResolvedValue(3)
      vi.mocked(db.event.count).mockResolvedValue(15)
      vi.mocked(db.contact.count).mockResolvedValue(25)

      const result = await getUserStats()

      expect(result.success).toBe(true)
      expect(result.stats).toEqual({
        groupsCount: 3,
        eventsCount: 15,
        contactsCount: 25,
      })
    })

    it('should count only active memberships', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.count).mockResolvedValue(2)
      vi.mocked(db.event.count).mockResolvedValue(10)
      vi.mocked(db.contact.count).mockResolvedValue(20)

      await getUserStats()

      expect(db.membership.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: 'ACTIVE',
        },
      })
    })

    it('should count only non-deleted events and contacts', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.count).mockResolvedValue(2)
      vi.mocked(db.event.count).mockResolvedValue(10)
      vi.mocked(db.contact.count).mockResolvedValue(20)

      await getUserStats()

      expect(db.event.count).toHaveBeenCalledWith({
        where: {
          contact: {
            memberships: {
              some: {
                userId: 'user-1',
                status: 'ACTIVE',
              },
            },
          },
          deletedAt: null,
        },
      })

      expect(db.contact.count).toHaveBeenCalledWith({
        where: {
          memberships: {
            some: {
              userId: 'user-1',
              status: 'ACTIVE',
            },
          },
          deletedAt: null,
        },
      })
    })
  })
})

