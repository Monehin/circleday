import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getReminderRules, createReminderRule, updateReminderRule, deleteReminderRule } from '@/lib/actions/reminder-rules'

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
    membership: {
      findFirst: vi.fn(),
    },
    reminderRule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'

describe('Reminder Rules Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReminderRules', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await getReminderRules('group-1')

      expect(result.error).toBe('Unauthorized')
    })

    it('should return error if user is not a member of the group', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.findFirst).mockResolvedValue(null)

      const result = await getReminderRules('group-1')

      expect(result.error).toBe('You do not have access to this group')
    })

    it('should return reminder rules for the group', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.findFirst).mockResolvedValue({
        id: 'membership-1',
        groupId: 'group-1',
        userId: 'user-1',
        status: 'ACTIVE',
      } as any)

      const mockRules = [
        {
          id: 'rule-1',
          groupId: 'group-1',
          offsets: [-7, -1, 0],
          channels: { '-7': ['EMAIL'], '-1': ['EMAIL'], '0': ['EMAIL', 'SMS'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(db.reminderRule.findMany).mockResolvedValue(mockRules as any)

      const result = await getReminderRules('group-1')

      expect(result.success).toBe(true)
      expect(result.rules).toEqual(mockRules)
    })
  })

  describe('createReminderRule', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await createReminderRule({
        groupId: 'group-1',
        offsets: [-7],
        channels: { '-7': ['EMAIL'] },
        sendHour: 9,
      })

      expect(result.error).toBe('Unauthorized')
    })

    it('should return error if user is not owner or admin', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.findFirst).mockResolvedValue(null)

      const result = await createReminderRule({
        groupId: 'group-1',
        offsets: [-7],
        channels: { '-7': ['EMAIL'] },
        sendHour: 9,
      })

      expect(result.error).toBe('You do not have permission to create reminder rules for this group')
    })

    it('should create reminder rule successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.membership.findFirst).mockResolvedValue({
        id: 'membership-1',
        groupId: 'group-1',
        userId: 'user-1',
        role: 'OWNER',
        status: 'ACTIVE',
      } as any)

      const mockRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-7, -1, 0],
        channels: { '-7': ['EMAIL'], '-1': ['EMAIL'], '0': ['EMAIL', 'SMS'] },
        sendHour: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.reminderRule.create).mockResolvedValue(mockRule as any)

      const result = await createReminderRule({
        groupId: 'group-1',
        offsets: [-7, -1, 0],
        channels: { '-7': ['EMAIL'], '-1': ['EMAIL'], '0': ['EMAIL', 'SMS'] },
        sendHour: 9,
      })

      expect(result.success).toBe(true)
      expect(result.rule).toEqual(mockRule)
    })

    it('should validate that at least one offset is provided', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      const result = await createReminderRule({
        groupId: 'group-1',
        offsets: [],
        channels: {},
        sendHour: 9,
      })

      expect(result.error).toContain('At least one reminder offset is required')
    })
  })

  describe('updateReminderRule', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await updateReminderRule({
        id: 'rule-1',
        offsets: [-7],
      })

      expect(result.error).toBe('Unauthorized')
    })

    it('should return error if rule not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.reminderRule.findUnique).mockResolvedValue(null)

      const result = await updateReminderRule({
        id: 'rule-1',
        offsets: [-7],
      })

      expect(result.error).toBe('Reminder rule not found')
    })

    it('should return error if user does not have permission', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.reminderRule.findUnique).mockResolvedValue({
        id: 'rule-1',
        groupId: 'group-1',
        group: {
          memberships: [], // No memberships for this user
        },
      } as any)

      const result = await updateReminderRule({
        id: 'rule-1',
        offsets: [-7],
      })

      expect(result.error).toBe('You do not have permission to update this reminder rule')
    })

    it('should update reminder rule successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.reminderRule.findUnique).mockResolvedValue({
        id: 'rule-1',
        groupId: 'group-1',
        group: {
          memberships: [{ userId: 'user-1', role: 'OWNER', status: 'ACTIVE' }],
        },
      } as any)

      const mockUpdatedRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-7, -3],
        channels: { '-7': ['EMAIL'], '-3': ['EMAIL', 'SMS'] },
        sendHour: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.reminderRule.update).mockResolvedValue(mockUpdatedRule as any)

      const result = await updateReminderRule({
        id: 'rule-1',
        offsets: [-7, -3],
        sendHour: 10,
      })

      expect(result.success).toBe(true)
      expect(result.rule).toEqual(mockUpdatedRule)
    })
  })

  describe('deleteReminderRule', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await deleteReminderRule('rule-1')

      expect(result.error).toBe('Unauthorized')
    })

    it('should return error if rule not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.reminderRule.findUnique).mockResolvedValue(null)

      const result = await deleteReminderRule('rule-1')

      expect(result.error).toBe('Reminder rule not found')
    })

    it('should return error if user does not have permission', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.reminderRule.findUnique).mockResolvedValue({
        id: 'rule-1',
        groupId: 'group-1',
        group: {
          memberships: [], // No memberships for this user
        },
      } as any)

      const result = await deleteReminderRule('rule-1')

      expect(result.error).toBe('You do not have permission to delete this reminder rule')
    })

    it('should delete reminder rule successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', userId: 'user-1', expiresAt: new Date(), token: 'token' },
      } as any)

      vi.mocked(db.reminderRule.findUnique).mockResolvedValue({
        id: 'rule-1',
        groupId: 'group-1',
        group: {
          memberships: [{ userId: 'user-1', role: 'ADMIN', status: 'ACTIVE' }],
        },
      } as any)

      vi.mocked(db.reminderRule.delete).mockResolvedValue({ id: 'rule-1' } as any)

      const result = await deleteReminderRule('rule-1')

      expect(result.success).toBe(true)
      expect(db.reminderRule.delete).toHaveBeenCalledWith({
        where: { id: 'rule-1' },
      })
    })
  })
})

