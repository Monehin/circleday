'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { startOfDay, endOfDay, addYears, isBefore, parseISO } from 'date-fns'

// Define types for the events
export type EventListItem = {
  id: string
  contactId: string
  contactName: string
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM'
  title: string | null
  date: Date
  yearKnown: boolean
  repeat: boolean
  notes: string | null
  nextOccurrence: Date // Calculated next occurrence date
  daysUntil: number // Days until next occurrence
  age?: number // Only for birthdays with known year
  years?: number // Only for anniversaries with known year
}

const createEventSchema = z.object({
  contactId: z.string(),
  type: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'CUSTOM']),
  title: z.string().optional(), // Required for CUSTOM events
  date: z.string(), // ISO date string
  yearKnown: z.boolean().default(true),
  repeat: z.boolean().default(true),
  notes: z.string().optional(),
}).refine(data => {
  // Title is required for CUSTOM events
  if (data.type === 'CUSTOM' && !data.title) {
    return false
  }
  return true
}, {
  message: 'Title is required for custom events',
  path: ['title'],
})

export async function createEvent(data: z.infer<typeof createEventSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = createEventSchema.parse(data)

    // Check if user has access to this contact through any group membership
    const contact = await db.contact.findFirst({
      where: {
        id: validated.contactId,
        memberships: {
          some: {
            group: {
              memberships: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    })

    if (!contact) {
      return { error: 'Contact not found or access denied' }
    }

    // Create event
    const event = await db.event.create({
      data: {
        contactId: validated.contactId,
        type: validated.type,
        title: validated.title,
        date: new Date(validated.date),
        yearKnown: validated.yearKnown,
        repeat: validated.repeat,
        notes: validated.notes,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return { success: true, event }
  } catch (error) {
    console.error('Failed to create event:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to create event' }
  }
}

export async function getUpcomingEvents(limit: number = 50) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Fetch all events for contacts in user's groups
    const events = await db.event.findMany({
      where: {
        deletedAt: null,
        contact: {
          memberships: {
            some: {
              group: {
                memberships: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Calculate next occurrence for each event
    const today = startOfDay(new Date())
    const eventsWithNextOccurrence: EventListItem[] = []

    for (const event of events) {
      const eventDate = new Date(event.date)
      const month = eventDate.getMonth()
      const day = eventDate.getDate()
      const originalYear = eventDate.getFullYear()

      // Calculate next occurrence
      let nextOccurrence = new Date(today.getFullYear(), month, day)
      
      // If this year's occurrence has passed, use next year
      if (isBefore(nextOccurrence, today)) {
        nextOccurrence = new Date(today.getFullYear() + 1, month, day)
      }

      // Calculate days until
      const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Calculate age/years if year is known
      let age: number | undefined
      let years: number | undefined

      if (event.yearKnown) {
        const yearsSince = nextOccurrence.getFullYear() - originalYear
        if (event.type === 'BIRTHDAY') {
          age = yearsSince
        } else if (event.type === 'ANNIVERSARY') {
          years = yearsSince
        }
      }

      eventsWithNextOccurrence.push({
        id: event.id,
        contactId: event.contactId,
        contactName: event.contact.name,
        type: event.type as 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM',
        title: event.title,
        date: event.date,
        yearKnown: event.yearKnown,
        repeat: event.repeat,
        notes: event.notes,
        nextOccurrence,
        daysUntil,
        age,
        years,
      })
    }

    // Sort by days until (soonest first)
    eventsWithNextOccurrence.sort((a, b) => a.daysUntil - b.daysUntil)

    // Limit results
    const limitedEvents = eventsWithNextOccurrence.slice(0, limit)

    return { success: true, events: limitedEvents }
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return { error: 'Failed to fetch events' }
  }
}

export async function getEventById(eventId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Fetch event with access check
    const event = await db.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
        contact: {
          memberships: {
            some: {
              group: {
                memberships: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            timezone: true,
          },
        },
      },
    })

    if (!event) {
      return { error: 'Event not found or access denied' }
    }

    return { success: true, event }
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return { error: 'Failed to fetch event' }
  }
}

const updateEventSchema = z.object({
  eventId: z.string(),
  title: z.string().optional(),
  date: z.string().optional(), // ISO date string
  yearKnown: z.boolean().optional(),
  repeat: z.boolean().optional(),
  notes: z.string().optional(),
})

export async function updateEvent(data: z.infer<typeof updateEventSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = updateEventSchema.parse(data)

    // Check if user has access to this event
    const event = await db.event.findFirst({
      where: {
        id: validated.eventId,
        deletedAt: null,
        contact: {
          memberships: {
            some: {
              group: {
                memberships: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!event) {
      return { error: 'Event not found or access denied' }
    }

    // Update event
    const updatedEvent = await db.event.update({
      where: { id: validated.eventId },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.date && { date: new Date(validated.date) }),
        ...(validated.yearKnown !== undefined && { yearKnown: validated.yearKnown }),
        ...(validated.repeat !== undefined && { repeat: validated.repeat }),
        ...(validated.notes !== undefined && { notes: validated.notes }),
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return { success: true, event: updatedEvent }
  } catch (error) {
    console.error('Failed to update event:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to update event' }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Check if user has access to this event
    const event = await db.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
        contact: {
          memberships: {
            some: {
              group: {
                memberships: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!event) {
      return { error: 'Event not found or access denied' }
    }

    // Soft delete the event
    await db.event.update({
      where: { id: eventId },
      data: {
        deletedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete event:', error)
    return { error: 'Failed to delete event' }
  }
}

export async function getContactsForEvents(groupId?: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Fetch contacts in user's groups (optionally filtered by specific group)
    const contacts = await db.contact.findMany({
      where: {
        deletedAt: null,
        memberships: {
          some: {
            group: {
              ...(groupId && { id: groupId }),
              memberships: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { success: true, contacts }
  } catch (error) {
    console.error('Failed to fetch contacts:', error)
    return { error: 'Failed to fetch contacts' }
  }
}

/**
 * Get all events for a specific contact
 */
export async function getContactEvents(contactId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Check if user has access to this contact through any group membership
    const contact = await db.contact.findFirst({
      where: {
        id: contactId,
        deletedAt: null,
        memberships: {
          some: {
            group: {
              memberships: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    })

    if (!contact) {
      return { error: 'Contact not found or access denied' }
    }

    // Fetch all events for this contact
    const events = await db.event.findMany({
      where: {
        contactId,
        deletedAt: null,
      },
      orderBy: [
        { type: 'asc' }, // Group by type (BIRTHDAY, ANNIVERSARY, CUSTOM)
        { date: 'asc' }, // Then by date
      ],
    })

    return { success: true, events }
  } catch (error) {
    console.error('Failed to fetch contact events:', error)
    return { error: 'Failed to fetch contact events' }
  }
}

