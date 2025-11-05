'use server'

/**
 * Bulk Event Management Actions
 * 
 * Server actions for creating multiple events at once for a contact.
 * Used by group admins to quickly add birthday, anniversary, and custom events.
 */

import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Validation Schemas
// ============================================================================

const BulkEventInput = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  events: z.array(
    z.object({
      type: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'CUSTOM']),
      title: z.string().optional(),
      date: z.string().datetime(),
      yearKnown: z.boolean().default(true),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one event is required'),
})

export type BulkEventInput = z.infer<typeof BulkEventInput>

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create multiple events for a contact at once
 * 
 * This action allows group owners/admins to quickly add multiple events
 * for a member (e.g., birthday, anniversary, custom events) in one go.
 * 
 * @returns Object with success status and created events or error message
 */
export async function createBulkEvents(input: BulkEventInput) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in to create events',
      }
    }

    // 2. Validate input
    const validation = BulkEventInput.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { contactId, groupId, events } = validation.data

    // 3. Check permissions - user must be owner of the group
    const membership = await db.membership.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
      include: {
        group: true,
      },
    })

    if (!membership || membership.group.ownerId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to add events for this group',
      }
    }

    // 4. Verify contact belongs to this group
    const contactMembership = await db.membership.findFirst({
      where: {
        groupId,
        contactId,
      },
      include: {
        contact: true,
      },
    })

    if (!contactMembership) {
      return {
        success: false,
        error: 'Contact not found in this group',
      }
    }

    // 5. Check event limit if set
    if (membership.group.maxEventsPerMember) {
      // Count existing events for this contact
      const existingEventCount = await db.event.count({
        where: {
          contactId,
          deletedAt: null,
        },
      })

      // Calculate total after adding new events
      // For non-custom events, we update existing ones, so count unique types
      const birthdayIndex = events.findIndex(e => e.type === 'BIRTHDAY')
      const anniversaryIndex = events.findIndex(e => e.type === 'ANNIVERSARY')
      const customEvents = events.filter(e => e.type === 'CUSTOM')
      
      const existingBirthday = await db.event.findFirst({
        where: { contactId, type: 'BIRTHDAY', deletedAt: null },
      })
      const existingAnniversary = await db.event.findFirst({
        where: { contactId, type: 'ANNIVERSARY', deletedAt: null },
      })

      // Count new events that will actually be added
      const newEventsCount = 
        (birthdayIndex >= 0 && !existingBirthday ? 1 : 0) +
        (anniversaryIndex >= 0 && !existingAnniversary ? 1 : 0) +
        customEvents.length

      const totalAfterAdd = existingEventCount + newEventsCount

      if (totalAfterAdd > membership.group.maxEventsPerMember) {
        return {
          success: false,
          error: `This member can have a maximum of ${membership.group.maxEventsPerMember} events. They currently have ${existingEventCount}. Adding ${newEventsCount} more would exceed the limit.`,
        }
      }
    }

    // 6. Create all events in a transaction
    const createdEvents = await db.$transaction(async (tx) => {
      const results = []

      for (const event of events) {
        // Check if event type already exists (don't create duplicates for BIRTHDAY/ANNIVERSARY)
        if (event.type !== 'CUSTOM') {
          const existing = await tx.event.findFirst({
            where: {
              contactId,
              type: event.type,
            },
          })

          if (existing) {
            // Update existing instead of creating duplicate
            const updated = await tx.event.update({
              where: { id: existing.id },
              data: {
                date: new Date(event.date),
                yearKnown: event.yearKnown,
                notes: event.notes,
                updatedAt: new Date(),
              },
            })
            results.push(updated)
            continue
          }
        }

        // Create new event
        const created = await tx.event.create({
          data: {
            contactId,
            type: event.type,
            title: event.title,
            date: new Date(event.date),
            yearKnown: event.yearKnown,
            notes: event.notes,
          },
        })
        results.push(created)
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          groupId,
          method: 'CREATE',
          entity: 'Event',
          entityId: contactId,
          diffJson: {
            action: 'bulk_create_events',
            contact: contactMembership.contact.name,
            eventCount: results.length,
            events: results.map((e) => ({
              type: e.type,
              date: e.date.toISOString(),
            })),
          },
        },
      })

      return results
    })

    // 6. Revalidate relevant pages
    revalidatePath(`/groups/${groupId}`)
    revalidatePath('/events')

    return {
      success: true,
      data: createdEvents,
    }
  } catch (error) {
    console.error('Failed to create bulk events:', error)
    return {
      success: false,
      error: 'Failed to create events. Please try again.',
    }
  }
}

/**
 * Get existing events for a contact to pre-populate the form
 * 
 * @param contactId - The contact ID
 * @param groupId - The group ID (for permission check)
 * @returns Object with success status and events or error message
 */
export async function getContactEvents(contactId: string, groupId: string) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    // 2. Check permissions
    const membership = await db.membership.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return {
        success: false,
        error: 'You do not have permission to view this contact',
      }
    }

    // 3. Get events
    const events = await db.event.findMany({
      where: {
        contactId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return {
      success: true,
      data: events,
    }
  } catch (error) {
    console.error('Failed to get contact events:', error)
    return {
      success: false,
      error: 'Failed to load events',
    }
  }
}

