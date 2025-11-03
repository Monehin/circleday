import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateRemindersForToday, getReminderStats } from '@/lib/services/reminder-calculator'
import { addDays, subDays, addYears } from 'date-fns'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    reminderRule: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    event: {
      count: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'

describe('Reminder Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateRemindersForToday', () => {
    it('should return empty array when no reminder rules exist', async () => {
      vi.mocked(db.reminderRule.findMany).mockResolvedValue([])

      const reminders = await calculateRemindersForToday()

      expect(reminders).toEqual([])
    })

    it('should calculate reminders for events matching offset', async () => {
      const today = new Date()
      const eventDate = addDays(today, 7) // Event is 7 days from now

      const mockRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-7, -1, 0], // Remind 7 days before, 1 day before, and on the day
        channels: {
          '-7': ['EMAIL'],
          '-1': ['EMAIL'],
          '0': ['EMAIL', 'SMS'],
        },
        sendHour: 9,
        group: {
          name: 'Family',
          memberships: [
            {
              id: 'membership-1',
              user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'Test User',
                defaultTimezone: 'America/New_York',
              },
              contact: {
                id: 'contact-1',
                name: 'Mom',
                email: 'mom@example.com',
                phone: '+1234567890',
                events: [
                  {
                    id: 'event-1',
                    type: 'BIRTHDAY',
                    title: null,
                    date: eventDate,
                    yearKnown: true,
                    repeat: true,
                    deletedAt: null,
                  },
                ],
              },
              status: 'ACTIVE',
            },
          ],
        },
      }

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([mockRule] as any)

      const reminders = await calculateRemindersForToday()

      // Should find a reminder for the event 7 days away with offset -7
      expect(reminders).toHaveLength(1)
      if (reminders.length > 0) {
        expect(reminders[0]).toMatchObject({
          eventType: 'BIRTHDAY',
          contactName: 'Mom',
          daysUntil: 7,
          offset: -7,
          channels: ['EMAIL'],
          recipientEmail: 'user@example.com',
        })
      }
    })

    it('should handle multiple reminders for the same event on different days', async () => {
      const today = new Date()
      const eventDate = addDays(today, 1) // Event is tomorrow

      const mockRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-1, 0], // Remind 1 day before and on the day
        channels: {
          '-1': ['EMAIL'],
          '0': ['EMAIL', 'SMS'],
        },
        sendHour: 9,
        group: {
          name: 'Family',
          memberships: [
            {
              user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'Test User',
                defaultTimezone: 'UTC',
              },
              contact: {
                name: 'Friend',
                email: 'friend@example.com',
                phone: null,
                events: [
                  {
                    id: 'event-1',
                    type: 'ANNIVERSARY',
                    title: 'Wedding Anniversary',
                    date: eventDate,
                    yearKnown: true,
                    repeat: true,
                    deletedAt: null,
                  },
                ],
              },
              status: 'ACTIVE',
            },
          ],
        },
      }

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([mockRule] as any)

      const reminders = await calculateRemindersForToday()

      // Should find a reminder for tomorrow (offset -1)
      expect(reminders).toHaveLength(1)
      if (reminders.length > 0) {
        expect(reminders[0]!.daysUntil).toBe(1)
        expect(reminders[0]!.offset).toBe(-1)
      }
    })

    it('should handle recurring events and calculate next occurrence', async () => {
      const today = new Date()
      const pastDate = subDays(today, 30) // Event date was 30 days ago
      const nextYear = addYears(pastDate, 1) // But it's recurring, so next occurrence is next year

      const mockRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-1],
        channels: {
          '-1': ['EMAIL'],
        },
        sendHour: 9,
        group: {
          name: 'Work',
          memberships: [
            {
              user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'Test User',
                defaultTimezone: 'UTC',
              },
              contact: {
                name: 'Boss',
                email: 'boss@example.com',
                phone: null,
                events: [
                  {
                    id: 'event-1',
                    type: 'BIRTHDAY',
                    title: null,
                    date: pastDate,
                    yearKnown: true,
                    repeat: true, // Recurring!
                    deletedAt: null,
                  },
                ],
              },
              status: 'ACTIVE',
            },
          ],
        },
      }

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([mockRule] as any)

      const reminders = await calculateRemindersForToday()

      // The event date has passed, so next occurrence should be next year
      // Reminders will only be sent when the next occurrence matches an offset
      // Since the next occurrence is ~335 days away and we only have offset -1,
      // no reminders should be sent today
      expect(reminders).toHaveLength(0)
    })

    it('should skip deleted events', async () => {
      const today = new Date()
      const eventDate = addDays(today, 7)

      const mockRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-7],
        channels: {
          '-7': ['EMAIL'],
        },
        sendHour: 9,
        group: {
          name: 'Family',
          memberships: [
            {
              user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'Test User',
                defaultTimezone: 'UTC',
              },
              contact: {
                name: 'Deleted Contact',
                email: 'deleted@example.com',
                phone: null,
                events: [
                  {
                    id: 'event-1',
                    type: 'BIRTHDAY',
                    title: null,
                    date: eventDate,
                    yearKnown: true,
                    repeat: true,
                    deletedAt: new Date(), // Event is deleted!
                  },
                ],
              },
              status: 'ACTIVE',
            },
          ],
        },
      }

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([mockRule] as any)

      const reminders = await calculateRemindersForToday()

      // Deleted events should be filtered out
      expect(reminders).toHaveLength(0)
    })

    it('should only send email reminders to users with email addresses', async () => {
      const today = new Date()
      const eventDate = addDays(today, 7)

      const mockRule = {
        id: 'rule-1',
        groupId: 'group-1',
        offsets: [-7],
        channels: {
          '-7': ['EMAIL'],
        },
        sendHour: 9,
        group: {
          name: 'Family',
          memberships: [
            {
              user: null, // No user linked!
              contact: {
                name: 'Contact Without User',
                email: 'contact@example.com',
                phone: null,
                events: [
                  {
                    id: 'event-1',
                    type: 'BIRTHDAY',
                    title: null,
                    date: eventDate,
                    yearKnown: true,
                    repeat: true,
                    deletedAt: null,
                  },
                ],
              },
              status: 'ACTIVE',
            },
          ],
        },
      }

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([mockRule] as any)

      const reminders = await calculateRemindersForToday()

      // No user linked, so no email can be sent
      expect(reminders).toHaveLength(0)
    })
  })

  describe('getReminderStats', () => {
    it('should return reminder statistics', async () => {
      vi.mocked(db.reminderRule.count).mockResolvedValue(5)
      vi.mocked(db.event.count).mockResolvedValue(25)
      vi.mocked(db.reminderRule.findMany).mockResolvedValue([])

      const stats = await getReminderStats()

      expect(stats.totalRules).toBe(5)
      expect(stats.totalEvents).toBe(25)
      expect(stats.scheduledToday).toBe(0) // No reminders scheduled
    })
  })
})

