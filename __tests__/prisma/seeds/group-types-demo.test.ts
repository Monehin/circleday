import { describe, it, expect } from 'vitest'
import { addDays } from 'date-fns'
import { generateDailyQaEvents } from '@/prisma/seeds/group-types-demo'

describe('generateDailyQaEvents', () => {
  it('creates one event per contact, starting tomorrow, with sequential titles', () => {
    const today = new Date('2025-01-01T00:00:00Z')
    const contacts = Array.from({ length: 7 }).map((_, idx) => ({ id: `c-${idx + 1}` }))

    const events = generateDailyQaEvents(contacts, today)

    expect(events).toHaveLength(7)
    events.forEach((evt, idx) => {
      const expectedDate = addDays(today, idx + 1)
      expect(evt.contactId).toBe(contacts[idx]!.id)
      expect(evt.title).toBe(`QA Daily Check ${idx + 1}`)
      expect(evt.date.getFullYear()).toBe(expectedDate.getFullYear())
      expect(evt.date.getMonth()).toBe(expectedDate.getMonth())
      expect(evt.date.getDate()).toBe(expectedDate.getDate())
    })
  })

  it('skips contacts without ids', () => {
    const today = new Date('2025-01-01T00:00:00Z')
    const contacts = [{ id: 'c-1' }, { id: '' as unknown as string }, { id: 'c-3' }]

    const events = generateDailyQaEvents(contacts, today)

    expect(events).toHaveLength(2)
    expect(events[0]!.contactId).toBe('c-1')
    expect(events[1]!.contactId).toBe('c-3')
  })
})

