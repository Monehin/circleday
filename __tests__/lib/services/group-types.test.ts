import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { scheduleUpcomingReminders } from '@/lib/services/reminder-scheduler'
import { addDays, startOfDay } from 'date-fns'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    reminderRule: {
      findMany: vi.fn(),
    },
    scheduledSend: {
      upsert: vi.fn(),
    },
    suppression: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Group Types - Reminder Distribution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PERSONAL Group Type', () => {
    it('should only send reminders to the group owner', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 7)

      // Mock a PERSONAL group with 3 members
      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'personal-group',
          offsets: [-1],
          channels: { '-1': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'personal-group',
            name: 'My Family',
            type: 'PERSONAL' as const,
            ownerId: 'owner-user',
            defaultTimezone: 'UTC',
            quietHours: null,
            leapDayPolicy: 'FEB_28',
            maxEventsPerMember: null,
            remindersEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            memberships: [
              // Owner membership
              {
                id: 'membership-owner',
                groupId: 'personal-group',
                userId: 'owner-user',
                contactId: 'contact-owner',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'owner-user',
                  name: 'Alice (Owner)',
                  email: 'alice@example.com',
                  phone: '+14155551111',
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
                  id: 'contact-owner',
                  name: 'Alice',
                  email: 'alice@example.com',
                  phone: '+14155551111',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
              // Member 1 with birthday
              {
                id: 'membership-1',
                groupId: 'personal-group',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  name: 'Bob',
                  email: 'bob@example.com',
                  phone: '+14155552222',
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
                  name: 'Bob',
                  email: 'bob@example.com',
                  phone: '+14155552222',
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
                      isGroupEvent: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
              // Member 2
              {
                id: 'membership-2',
                groupId: 'personal-group',
                userId: 'user-2',
                contactId: 'contact-2',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-2',
                  name: 'Charlie',
                  email: 'charlie@example.com',
                  phone: '+14155553333',
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
                  id: 'contact-2',
                  name: 'Charlie',
                  email: 'charlie@example.com',
                  phone: '+14155553333',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      // Should schedule exactly 1 reminder (only to owner)
      expect(result.scheduled).toBe(1)
      expect(db.scheduledSend.upsert).toHaveBeenCalledTimes(1)

      // Verify the reminder is for the owner
      const call = vi.mocked(db.scheduledSend.upsert).mock.calls[0][0]
      expect(call.create.recipientUserId).toBe('owner-user')
    })

    it('should send reminders to owner for all member events', async () => {
      const today = startOfDay(new Date())
      const futureDate1 = addDays(today, 5)
      const futureDate2 = addDays(today, 10)

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'personal-group',
          offsets: [-1],
          channels: { '-1': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'personal-group',
            name: 'My Team',
            type: 'PERSONAL' as const,
            ownerId: 'owner-user',
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
                id: 'membership-owner',
                groupId: 'personal-group',
                userId: 'owner-user',
                contactId: 'contact-owner',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'owner-user',
                  name: 'Manager',
                  email: 'manager@example.com',
                  phone: '+14155551111',
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
                  id: 'contact-owner',
                  name: 'Manager',
                  email: 'manager@example.com',
                  phone: '+14155551111',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
              {
                id: 'membership-1',
                groupId: 'personal-group',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  name: 'Employee 1',
                  email: 'emp1@example.com',
                  phone: '+14155552222',
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
                  name: 'Employee 1',
                  email: 'emp1@example.com',
                  phone: '+14155552222',
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
                      date: futureDate1,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      isGroupEvent: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
              {
                id: 'membership-2',
                groupId: 'personal-group',
                userId: 'user-2',
                contactId: 'contact-2',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-2',
                  name: 'Employee 2',
                  email: 'emp2@example.com',
                  phone: '+14155553333',
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
                  id: 'contact-2',
                  name: 'Employee 2',
                  email: 'emp2@example.com',
                  phone: '+14155553333',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-2',
                      contactId: 'contact-2',
                      type: 'WORK_ANNIVERSARY' as const,
                      title: null,
                      date: futureDate2,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      isGroupEvent: false,
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

      // Should schedule 2 reminders (both to owner, one for each event)
      expect(result.scheduled).toBe(2)
      expect(db.scheduledSend.upsert).toHaveBeenCalledTimes(2)

      // Verify all reminders are for the owner
      const calls = vi.mocked(db.scheduledSend.upsert).mock.calls
      calls.forEach(call => {
        expect(call[0].create.recipientUserId).toBe('owner-user')
      })
    })
  })

  describe('TEAM Group Type', () => {
    it('should send reminders to all members except the person being celebrated', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 7)

      // Mock a TEAM group with 4 members, one has a birthday
      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'team-group',
          offsets: [-1],
          channels: { '-1': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'team-group',
            name: 'Friend Circle',
            type: 'TEAM' as const,
            ownerId: 'owner-user',
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
                id: 'membership-owner',
                groupId: 'team-group',
                userId: 'owner-user',
                contactId: 'contact-owner',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'owner-user',
                  name: 'Alice',
                  email: 'alice@example.com',
                  phone: '+14155551111',
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
                  id: 'contact-owner',
                  name: 'Alice',
                  email: 'alice@example.com',
                  phone: '+14155551111',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
              // Bob has a birthday - should NOT receive reminder
              {
                id: 'membership-1',
                groupId: 'team-group',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  name: 'Bob',
                  email: 'bob@example.com',
                  phone: '+14155552222',
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
                  name: 'Bob',
                  email: 'bob@example.com',
                  phone: '+14155552222',
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
                      isGroupEvent: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
              // Charlie - should receive reminder
              {
                id: 'membership-2',
                groupId: 'team-group',
                userId: 'user-2',
                contactId: 'contact-2',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-2',
                  name: 'Charlie',
                  email: 'charlie@example.com',
                  phone: '+14155553333',
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
                  id: 'contact-2',
                  name: 'Charlie',
                  email: 'charlie@example.com',
                  phone: '+14155553333',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
              // Diana - should receive reminder
              {
                id: 'membership-3',
                groupId: 'team-group',
                userId: 'user-3',
                contactId: 'contact-3',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-3',
                  name: 'Diana',
                  email: 'diana@example.com',
                  phone: '+14155554444',
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
                  id: 'contact-3',
                  name: 'Diana',
                  email: 'diana@example.com',
                  phone: '+14155554444',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      // Should schedule 3 reminders (to Alice, Charlie, Diana - NOT Bob)
      expect(result.scheduled).toBe(3)
      expect(db.scheduledSend.upsert).toHaveBeenCalledTimes(3)

      // Verify Bob (the birthday person) does NOT receive a reminder
      const calls = vi.mocked(db.scheduledSend.upsert).mock.calls
      const recipientIds = calls.map(call => call[0].create.recipientUserId)
      
      expect(recipientIds).toContain('owner-user') // Alice
      expect(recipientIds).toContain('user-2') // Charlie
      expect(recipientIds).toContain('user-3') // Diana
      expect(recipientIds).not.toContain('user-1') // NOT Bob (birthday person)
    })

    it('should handle multiple events in TEAM group correctly', async () => {
      const today = startOfDay(new Date())
      const futureDate1 = addDays(today, 5)
      const futureDate2 = addDays(today, 10)

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'team-group',
          offsets: [-1],
          channels: { '-1': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'team-group',
            name: 'Family Group',
            type: 'TEAM' as const,
            ownerId: 'owner-user',
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
                id: 'membership-owner',
                groupId: 'team-group',
                userId: 'owner-user',
                contactId: 'contact-owner',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'owner-user',
                  name: 'Parent',
                  email: 'parent@example.com',
                  phone: '+14155551111',
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
                  id: 'contact-owner',
                  name: 'Parent',
                  email: 'parent@example.com',
                  phone: '+14155551111',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-owner',
                      contactId: 'contact-owner',
                      type: 'BIRTHDAY' as const,
                      title: null,
                      date: futureDate1,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      isGroupEvent: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
              {
                id: 'membership-1',
                groupId: 'team-group',
                userId: 'user-1',
                contactId: 'contact-1',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-1',
                  name: 'Child 1',
                  email: 'child1@example.com',
                  phone: '+14155552222',
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
                  name: 'Child 1',
                  email: 'child1@example.com',
                  phone: '+14155552222',
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
                      date: futureDate2,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      isGroupEvent: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
              {
                id: 'membership-2',
                groupId: 'team-group',
                userId: 'user-2',
                contactId: 'contact-2',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'user-2',
                  name: 'Child 2',
                  email: 'child2@example.com',
                  phone: '+14155553333',
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
                  id: 'contact-2',
                  name: 'Child 2',
                  email: 'child2@example.com',
                  phone: '+14155553333',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      // Should schedule 4 reminders:
      // - Parent's birthday: Child 1 + Child 2 = 2 reminders
      // - Child 1's birthday: Parent + Child 2 = 2 reminders
      expect(result.scheduled).toBe(4)
      expect(db.scheduledSend.upsert).toHaveBeenCalledTimes(4)
    })

    it('should not send reminders if owner is the only member with user account', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 7)

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'team-group',
          offsets: [-1],
          channels: { '-1': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: {
            id: 'team-group',
            name: 'Solo Team Group',
            type: 'TEAM' as const,
            ownerId: 'owner-user',
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
                id: 'membership-owner',
                groupId: 'team-group',
                userId: 'owner-user',
                contactId: 'contact-owner',
                role: 'OWNER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                  id: 'owner-user',
                  name: 'Solo Owner',
                  email: 'solo@example.com',
                  phone: '+14155551111',
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
                  id: 'contact-owner',
                  name: 'Solo Owner',
                  email: 'solo@example.com',
                  phone: '+14155551111',
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [
                    {
                      id: 'event-owner',
                      contactId: 'contact-owner',
                      type: 'BIRTHDAY' as const,
                      title: null,
                      date: futureDate,
                      yearKnown: true,
                      repeat: true,
                      notes: null,
                      isGroupEvent: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    },
                  ],
                },
              },
              // Contact without user account
              {
                id: 'membership-1',
                groupId: 'team-group',
                userId: null,
                contactId: 'contact-1',
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: null,
                contact: {
                  id: 'contact-1',
                  name: 'Contact Only',
                  email: 'contact@example.com',
                  phone: null,
                  timezone: 'UTC',
                  photoUrl: null,
                  locked: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  events: [],
                },
              },
            ],
          },
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      // Should schedule 0 reminders (owner is the birthday person, and there are no other users)
      expect(result.scheduled).toBe(0)
      expect(db.scheduledSend.upsert).not.toHaveBeenCalled()
    })
  })

  describe('Backward Compatibility', () => {
    it('should treat groups without type field as PERSONAL (default)', async () => {
      const today = startOfDay(new Date())
      const futureDate = addDays(today, 7)

      // Simulate an "old" group that might not have the type field explicitly set
      const groupData: any = {
        id: 'legacy-group',
        name: 'Legacy Group',
        // type is omitted, should default to PERSONAL
        ownerId: 'owner-user',
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
            id: 'membership-owner',
            groupId: 'legacy-group',
            userId: 'owner-user',
            contactId: 'contact-owner',
            role: 'OWNER' as const,
            status: 'ACTIVE' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: 'owner-user',
              name: 'Owner',
              email: 'owner@example.com',
              phone: '+14155551111',
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
              id: 'contact-owner',
              name: 'Owner',
              email: 'owner@example.com',
              phone: '+14155551111',
              timezone: 'UTC',
              photoUrl: null,
              locked: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
              events: [],
            },
          },
          {
            id: 'membership-1',
            groupId: 'legacy-group',
            userId: 'user-1',
            contactId: 'contact-1',
            role: 'MEMBER' as const,
            status: 'ACTIVE' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: 'user-1',
              name: 'Member',
              email: 'member@example.com',
              phone: '+14155552222',
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
              name: 'Member',
              email: 'member@example.com',
              phone: '+14155552222',
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
                  isGroupEvent: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                },
              ],
            },
          },
        ],
      }

      // Set to default PERSONAL if not present
      groupData.type = groupData.type || 'PERSONAL'

      vi.mocked(db.reminderRule.findMany).mockResolvedValue([
        {
          id: 'rule-1',
          groupId: 'legacy-group',
          offsets: [-1],
          channels: { '-1': ['EMAIL'] },
          sendHour: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
          group: groupData,
        },
      ] as any)

      vi.mocked(db.suppression.findUnique).mockResolvedValue(null)
      vi.mocked(db.scheduledSend.upsert).mockResolvedValue({} as any)

      const result = await scheduleUpcomingReminders()

      // Should behave as PERSONAL: only owner gets reminder
      expect(result.scheduled).toBe(1)
      
      const call = vi.mocked(db.scheduledSend.upsert).mock.calls[0][0]
      expect(call.create.recipientUserId).toBe('owner-user')
    })
  })
})

