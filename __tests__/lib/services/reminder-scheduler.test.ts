import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'
import {
  scheduleUpcomingReminders,
  getPendingScheduledSendsForToday,
  getFailedSendsToRetry,
  getSchedulerStats,
} from '@/lib/services/reminder-scheduler'
import { addDays, startOfDay } from 'date-fns'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    reminderRule: {
      findMany: vi.fn(),
    },
    scheduledSend: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    suppression: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Reminder Scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scheduleUpcomingReminders', () => {
    it('should schedule reminders for upcoming events', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 10)

      // Mock data
      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'group-1',
          offsets: [-7, -1, 0],
          channels: {
            '-7': ['EMAIL'],
            '-1': ['EMAIL', 'SMS'],
            '0': ['EMAIL', 'SMS'],
          },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'group-1',
            name: 'Test Group',
            type: 'PERSONAL' as const,
            ownerId: 'user-1',
            defaultTimezone: 'UTC',
            quietHours: null,
            leapDayPolicy: 'FEB_28',
            maxEventsPerMember: null,
            remindersEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            memberships: [
              {
                id: 'membership-1',
                groupId: 'group-1',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  name: 'John Doe',
                  email: 'john@example.com',
                  phone: '+14155552671',
                  emailVerified: true,
                  emailVerifiedAt: new Date(),
                  phoneVerified: true,
                  phoneVerifiedAt: new Date(),
                  defaultTimezone: 'UTC',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  lastLoginAt: new Date(),
                },
                contact: {
                  id: 'contact-1',
                  name: 'Jane Doe',
                  email: 'jane@example.com',
                  phone: '+14155552672',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-1',
                      contactId: 'contact-1',
                      type: 'BIRTHDAY' as const,
                      title: null,
                      date: futureDate,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      expect(result.scheduled).toBeGreaterThan(0)
      expect(result.errors).toBe(0)
      expect(db.scheduledSend.upsert).toHaveBeenCalled()
    })

    it('should skip suppressed recipients', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 5)

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'group-1',
          offsets: [-5],
          channels: { '-5': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'group-1',
            name: 'Test Group',
            type: 'PERSONAL' as const,
            ownerId: 'user-1',
            defaultTimezone: 'UTC',
            quietHours: null,
            leapDayPolicy: 'FEB_28',
            maxEventsPerMember: null,
            remindersEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            memberships: [
              {
                id: 'membership-1',
                groupId: 'group-1',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  email: 'john@example.com',
                  phone: null,
                  name: 'John Doe',
                  emailVerified: true,
                  emailVerifiedAt: new Date(),
                  phoneVerified: false,
                  phoneVerifiedAt: null,
                  defaultTimezone: 'UTC',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  lastLoginAt: new Date(),
                },
                contact: {
                  id: 'contact-1',
                  name: 'Jane Doe',
                  email: 'jane@example.com',
                  phone: null,
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-1',
                      contactId: 'contact-1',
                      type: 'BIRTHDAY' as const,
                      title: null,
                      date: futureDate,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
            ],
          },
        },
      ] as any)

      // Mock suppression for this email
      vi.mocked(db.suppression.findUnique).mockResolvedValue({
        id: 'suppression-1',
        channel: 'EMAIL',
        identifier: 'john@example.com',
        reason: 'UNSUBSCRIBE',
        createdAt: new Date(),
      } as any)

      const result = await scheduleUpcomingReminders()

      expect(result.skipped).toBeGreaterThan(0)
      expect(db.scheduledSend.upsert).not.toHaveBeenCalled()
    })

    it('should skip events outside the 30-day window', async () => {
      const today = startOfDay(new Date())
      const farFutureDate = addDays(today, 60) // 60 days out

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'group-1',
          offsets: [-7],
          channels: { '-7': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'group-1',
            name: 'Test Group',
            type: 'PERSONAL' as const,
            ownerId: 'user-1',
            defaultTimezone: 'UTC',
            quietHours: null,
            leapDayPolicy: 'FEB_28',
            maxEventsPerMember: null,
            remindersEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            memberships: [
              {
                id: 'membership-1',
                groupId: 'group-1',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  email: 'john@example.com',
                  phone: null,
                  name: 'John Doe',
                  emailVerified: true,
                  emailVerifiedAt: new Date(),
                  phoneVerified: false,
                  phoneVerifiedAt: null,
                  defaultTimezone: 'UTC',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  lastLoginAt: new Date(),
                },
                contact: {
                  id: 'contact-1',
                  name: 'Jane Doe',
                  email: 'jane@example.com',
                  phone: null,
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-1',
                      contactId: 'contact-1',
                      type: 'BIRTHDAY' as const,
                      title: null,
                      date: farFutureDate,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)

      const result = await scheduleUpcomingReminders()

      // Should not schedule anything because event is > 30 days away
      expect(result.scheduled).toBe(0)
      expect(db.scheduledSend.upsert).not.toHaveBeenCalled()
    })

    it('should handle multiple channels (EMAIL + SMS)', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 3)

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'group-1',
          offsets: [-3],
          channels: { '-3': ['EMAIL', 'SMS'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'group-1',
            name: 'Test Group',
            type: 'PERSONAL' as const,
            ownerId: 'user-1',
            defaultTimezone: 'UTC',
            quietHours: null,
            leapDayPolicy: 'FEB_28',
            maxEventsPerMember: null,
            remindersEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            memberships: [
              {
                id: 'membership-1',
                groupId: 'group-1',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  email: 'john@example.com',
                  phone: '+14155552671',
                  name: 'John Doe',
                  emailVerified: true,
                  emailVerifiedAt: new Date(),
                  phoneVerified: true,
                  phoneVerifiedAt: new Date(),
                  defaultTimezone: 'UTC',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  lastLoginAt: new Date(),
                },
                contact: {
                  id: 'contact-1',
                  name: 'Jane Doe',
                  email: 'jane@example.com',
                  phone: '+14155552672',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-1',
                      contactId: 'contact-1',
                      type: 'BIRTHDAY' as const,
                      title: null,
                      date: futureDate,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      // Should schedule 2 reminders (1 EMAIL + 1 SMS)
      expect(result.scheduled).toBe(2)
      expect(db.scheduledSend.upsert).toHaveBeenCalledTimes(2)
    })
  })

  describe('getPendingScheduledSendsForToday', () => {
    it('should return pending scheduled sends for today', async () => {
      const today = startOfDay(new Date())

      vi.mocked(db.scheduledSend.findMany).mockResolvedValue([
        {
          id: 'send-1',
          eventId: 'event-1',
          targetDate: addDays(today, 7),
          offset: -7,
          channel: 'EMAIL',
          dueAtUtc: today,
          status: 'PENDING',
          idempotencyKey: 'test-key',
          sentAt: null,
          failedAt: null,
          retryCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          event: {
            id: 'event-1',
            contactId: 'contact-1',
            type: 'BIRTHDAY',
            title: null,
            date: addDays(today, 7),
            yearKnown: true,
            repeat: true,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            contact: {
              id: 'contact-1',
              name: 'Jane Doe',
              email: 'jane@example.com',
              phone: null,
              timezone: 'UTC',
              photoUrl: null,
              locked: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            },
          },
        },
      ] as any)

      const result = await getPendingScheduledSendsForToday()

      expect(result).toHaveLength(1)
      expect(result[0]?.status).toBe('PENDING')
      expect(db.scheduledSend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['PENDING', 'QUEUED'] },
          }),
        })
      )
    })
  })

  describe('getFailedSendsToRetry', () => {
    it('should return failed sends with retry count under max', async () => {
      vi.mocked(db.scheduledSend.findMany).mockResolvedValue([
        {
          id: 'send-1',
          eventId: 'event-1',
          status: 'FAILED',
          retryCount: 1,
          event: {},
        },
      ] as any)

      const result = await getFailedSendsToRetry(3)

      expect(result).toHaveLength(1)
      expect(db.scheduledSend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FAILED',
            retryCount: { lt: 3 },
          }),
        })
      )
    })
  })

  describe('getSchedulerStats', () => {
    it('should return scheduler statistics', async () => {
      vi.mocked(db.scheduledSend.count)
        .mockResolvedValueOnce(10) // totalPending
        .mockResolvedValueOnce(50) // totalSent
        .mockResolvedValueOnce(5) // totalFailed
        .mockResolvedValueOnce(2) // totalRetrying

      vi.mocked(db.scheduledSend.findMany).mockResolvedValue([])

      const result = await getSchedulerStats()

      expect(result.totalPending).toBe(10)
      expect(result.totalSent).toBe(50)
      expect(result.totalFailed).toBe(5)
      expect(result.totalRetrying).toBe(2)
      expect(result.recentSends).toEqual([])
    })
  })
})

