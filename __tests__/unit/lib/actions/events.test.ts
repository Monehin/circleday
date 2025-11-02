import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent, getUpcomingEvents, getEventById, updateEvent, deleteEvent } from '@/lib/actions/events'

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
    event: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    contact: {
      findFirst: vi.fn(),
    },
  },
}))

describe('Events Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEvent', () => {
    it('should return error if user is not authenticated', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await createEvent({
        contactId: 'contact-1',
        type: 'BIRTHDAY',
        date: '2000-01-01',
        yearKnown: true,
        repeat: true,
      })

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should require title for CUSTOM events', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      const result = await createEvent({
        contactId: 'contact-1',
        type: 'CUSTOM',
        date: '2024-12-25',
        yearKnown: true,
        repeat: true,
      })

      expect(result.error).toBeDefined()
    })

    it('should return error if contact not found', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      vi.mocked(db.contact.findFirst).mockResolvedValueOnce(null)

      const result = await createEvent({
        contactId: 'contact-1',
        type: 'BIRTHDAY',
        date: '2000-01-01',
        yearKnown: true,
        repeat: true,
      })

      expect(result.error).toContain('not found')
    })

    it('should create birthday event successfully', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      vi.mocked(db.contact.findFirst).mockResolvedValueOnce({
        id: 'contact-1',
        name: 'John Doe',
      } as any)

      const mockEvent = {
        id: 'event-1',
        contactId: 'contact-1',
        type: 'BIRTHDAY',
        date: new Date('2000-01-01'),
        yearKnown: true,
        repeat: true,
        contact: { id: 'contact-1', name: 'John Doe' },
      }

      vi.mocked(db.event.create).mockResolvedValueOnce(mockEvent as any)

      const result = await createEvent({
        contactId: 'contact-1',
        type: 'BIRTHDAY',
        date: '2000-01-01',
        yearKnown: true,
        repeat: true,
      })

      expect(result.success).toBe(true)
      expect(result.event).toBeDefined()
    })
  })

  describe('getUpcomingEvents', () => {
    it('should return error if user is not authenticated', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await getUpcomingEvents()

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should calculate next occurrence and days until', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      const mockEvents = [
        {
          id: 'event-1',
          contactId: 'contact-1',
          type: 'BIRTHDAY',
          title: null,
          date: new Date('2000-06-15'),
          yearKnown: true,
          repeat: true,
          notes: null,
          contact: { id: 'contact-1', name: 'John Doe' },
        },
      ]

      vi.mocked(db.event.findMany).mockResolvedValueOnce(mockEvents as any)

      const result = await getUpcomingEvents()

      expect(result.success).toBe(true)
      expect(result.events).toHaveLength(1)
      expect(result.events).toBeDefined()
      if (result.events && result.events.length > 0) {
        const firstEvent = result.events[0]
        expect(firstEvent?.nextOccurrence).toBeDefined()
        expect(firstEvent?.daysUntil).toBeGreaterThanOrEqual(0)
      }
    })

    it('should calculate age for birthdays with known year', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      const mockEvents = [
        {
          id: 'event-1',
          contactId: 'contact-1',
          type: 'BIRTHDAY',
          title: null,
          date: new Date('2000-01-01'),
          yearKnown: true,
          repeat: true,
          notes: null,
          contact: { id: 'contact-1', name: 'John Doe' },
        },
      ]

      vi.mocked(db.event.findMany).mockResolvedValueOnce(mockEvents as any)

      const result = await getUpcomingEvents()

      expect(result.success).toBe(true)
      expect(result.events).toBeDefined()
      if (result.events && result.events.length > 0) {
        const firstEvent = result.events[0]
        expect(firstEvent?.age).toBeDefined()
        expect(firstEvent?.age).toBeGreaterThan(20)
      }
    })
  })

  describe('deleteEvent', () => {
    it('should return error if user is not authenticated', async () => {
      const { auth } = await import('@/lib/auth/config')
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await deleteEvent('event-1')

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should soft delete event', async () => {
      const { auth } = await import('@/lib/auth/config')
      const { db } = await import('@/lib/db')

      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      } as any)

      vi.mocked(db.event.findFirst).mockResolvedValueOnce({
        id: 'event-1',
        deletedAt: null,
      } as any)

      vi.mocked(db.event.update).mockResolvedValueOnce({} as any)

      const result = await deleteEvent('event-1')

      expect(result.success).toBe(true)
      expect(db.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: { deletedAt: expect.any(Date) },
      })
    })
  })
})

