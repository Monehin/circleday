'use server'

/**
 * Event Invite Token Management Actions
 * 
 * Server actions for creating, validating, and managing event invite tokens.
 * These tokens allow members to add their own events via a secure, expiring link.
 */

import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateSecureToken } from '@/lib/utils/token-generator'
import { addDays, addHours } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { sendEventInviteEmail } from '@/lib/email/event-invite'
import { sendEventInviteSMS } from '@/lib/sms/event-invite'

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateTokenInput = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  expirationPreset: z.enum(['24h', '7d', '30d', 'custom']),
  customExpiration: z.string().datetime().optional(),
  maxUses: z.number().int().min(1).max(10).default(1),
  sendEmail: z.boolean().default(false),
  sendSMS: z.boolean().default(false),
})

export type CreateTokenInput = z.infer<typeof CreateTokenInput>

const ValidateTokenInput = z.object({
  token: z.string().min(20, 'Invalid token format'),
})

const SubmitEventsInput = z.object({
  token: z.string().min(20, 'Invalid token format'),
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

// ============================================================================
// Helper Functions
// ============================================================================

function calculateExpiration(preset: string, customDate?: string): Date {
  if (preset === 'custom' && customDate) {
    return new Date(customDate)
  }

  const now = new Date()
  switch (preset) {
    case '24h':
      return addHours(now, 24)
    case '7d':
      return addDays(now, 7)
    case '30d':
      return addDays(now, 30)
    default:
      return addDays(now, 7) // Default to 7 days
  }
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create an event invite token for a contact
 * 
 * Generates a secure, expiring link that allows a member to add their own events
 * without needing to log in to the platform.
 * 
 * @returns Object with success status and token data or error message
 */
export async function createEventInviteToken(input: CreateTokenInput) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in to create invite links',
      }
    }

    // 2. Validate input
    const validation = CreateTokenInput.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { contactId, groupId, expirationPreset, customExpiration, maxUses, sendEmail, sendSMS } = validation.data

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
        error: 'You do not have permission to create invite links for this group',
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

    // 5. Generate token and calculate expiration
    const token = generateSecureToken()
    const expiresAt = calculateExpiration(expirationPreset, customExpiration)

    // 6. Create token in database
    const inviteToken = await db.eventInviteToken.create({
      data: {
        token,
        contactId,
        groupId,
        createdBy: session.user.id,
        expiresAt,
        maxUses,
      },
      include: {
        contact: true,
      },
    })

    // 7. Generate the invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/add-events/${token}`

    // 8. Send notifications if requested
    const notifications = {
      email: false,
      sms: false,
    }

    if (sendEmail && inviteToken.contact.email) {
      try {
        await sendEventInviteEmail({
          to: inviteToken.contact.email,
          contactName: inviteToken.contact.name,
          groupName: membership.group.name,
          inviteUrl,
          expiresAt,
        })
        notifications.email = true
      } catch (error) {
        console.error('Failed to send invite email:', error)
      }
    }

    if (sendSMS && inviteToken.contact.phone) {
      try {
        await sendEventInviteSMS({
          to: inviteToken.contact.phone,
          contactName: inviteToken.contact.name,
          groupName: membership.group.name,
          inviteUrl,
        })
        notifications.sms = true
      } catch (error) {
        console.error('Failed to send invite SMS:', error)
      }
    }

    // 9. Create audit log
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        groupId,
        method: 'CREATE',
        entity: 'EventInviteToken',
        entityId: inviteToken.id,
        diffJson: {
          contact: inviteToken.contact.name,
          expiresAt: expiresAt.toISOString(),
          maxUses,
          notifications,
        },
      },
    })

    return {
      success: true,
      data: {
        token: inviteToken.token,
        inviteUrl,
        expiresAt: inviteToken.expiresAt,
        maxUses: inviteToken.maxUses,
        contact: {
          id: inviteToken.contact.id,
          name: inviteToken.contact.name,
          email: inviteToken.contact.email,
          phone: inviteToken.contact.phone,
        },
        notifications,
      },
    }
  } catch (error) {
    console.error('Failed to create event invite token:', error)
    return {
      success: false,
      error: 'Failed to create invite link. Please try again.',
    }
  }
}

/**
 * Validate an event invite token
 * 
 * Checks if a token is valid, not expired, and not over the usage limit.
 * Used by the public event submission page to verify the token before showing the form.
 * 
 * @returns Object with success status and token data or error message
 */
export async function validateEventInviteToken(input: z.infer<typeof ValidateTokenInput>) {
  try {
    // 1. Validate input
    const validation = ValidateTokenInput.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid token format',
        errorType: 'INVALID_FORMAT' as const,
      }
    }

    const { token } = validation.data

    // 2. Find token in database
    const inviteToken = await db.eventInviteToken.findUnique({
      where: { token },
      include: {
        contact: {
          include: {
            events: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    if (!inviteToken) {
      return {
        success: false,
        error: 'Invalid or expired link',
        errorType: 'NOT_FOUND' as const,
      }
    }

    // 3. Check if expired
    if (inviteToken.expiresAt < new Date()) {
      return {
        success: false,
        error: 'This link has expired',
        errorType: 'EXPIRED' as const,
      }
    }

    // 4. Check if max uses exceeded
    if (inviteToken.useCount >= inviteToken.maxUses) {
      return {
        success: false,
        error: 'This link has been used the maximum number of times',
        errorType: 'MAX_USES_EXCEEDED' as const,
      }
    }

    // 5. Return token data
    return {
      success: true,
      data: {
        contact: {
          id: inviteToken.contact.id,
          name: inviteToken.contact.name,
          email: inviteToken.contact.email,
        },
        groupId: inviteToken.groupId,
        expiresAt: inviteToken.expiresAt,
        existingEvents: inviteToken.contact.events.map((e) => ({
          type: e.type,
          title: e.title,
          date: e.date,
          yearKnown: e.yearKnown,
        })),
      },
    }
  } catch (error) {
    console.error('Failed to validate token:', error)
    return {
      success: false,
      error: 'Failed to validate link',
      errorType: 'UNKNOWN' as const,
    }
  }
}

/**
 * Submit events via invite token (public action - no auth required)
 * 
 * Allows a member to add their own events via the secure invite link.
 * This action does not require authentication.
 * 
 * @returns Object with success status or error message
 */
export async function submitEventsViaToken(input: z.infer<typeof SubmitEventsInput>) {
  try {
    // 1. Validate input
    const validation = SubmitEventsInput.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { token, events } = validation.data

    // 2. Validate token (reuse existing validation)
    const tokenValidation = await validateEventInviteToken({ token })
    if (!tokenValidation.success) {
      return tokenValidation
    }

    const contactId = tokenValidation.data!.contact.id
    const groupId = tokenValidation.data!.groupId

    // 3. Check event limit if set
    const group = await db.group.findUnique({
      where: { id: groupId },
      select: { maxEventsPerMember: true },
    })

    if (group?.maxEventsPerMember) {
      // Count existing events for this contact
      const existingEventCount = await db.event.count({
        where: {
          contactId,
          deletedAt: null,
        },
      })

      // Calculate total after adding new events
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

      if (totalAfterAdd > group.maxEventsPerMember) {
        return {
          success: false,
          error: `You can have a maximum of ${group.maxEventsPerMember} events. You currently have ${existingEventCount}. Adding ${newEventsCount} more would exceed the limit.`,
        }
      }
    }

    // 4. Create events in a transaction
    const result = await db.$transaction(async (tx) => {
      const createdEvents = []

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
            createdEvents.push(updated)
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
        createdEvents.push(created)
      }

      // 5. Update token usage
      const updatedToken = await tx.eventInviteToken.update({
        where: { token },
        data: {
          useCount: { increment: 1 },
          usedAt: new Date(),
        },
      })

      // 6. Create audit log (from system/token)
      await tx.auditLog.create({
        data: {
          actorId: updatedToken.createdBy,
          groupId,
          method: 'CREATE',
          entity: 'Event',
          entityId: contactId,
          diffJson: {
            action: 'self_service_event_submission',
            contact: tokenValidation.data!.contact.name,
            eventCount: createdEvents.length,
            viaToken: true,
          },
        },
      })

      return createdEvents
    })

    // 7. Revalidate relevant pages
    revalidatePath(`/groups/${groupId}`)
    revalidatePath('/events')

    return {
      success: true,
      data: {
        eventCount: result.length,
      },
    }
  } catch (error) {
    console.error('Failed to submit events via token:', error)
    return {
      success: false,
      error: 'Failed to save your events. Please try again.',
    }
  }
}

/**
 * Get active tokens for a contact (admin only)
 * 
 * @param contactId - The contact ID
 * @param groupId - The group ID (for permission check)
 * @returns Object with success status and tokens or error message
 */
export async function getContactTokens(contactId: string, groupId: string) {
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
      include: {
        group: true,
      },
    })

    if (!membership || membership.group.ownerId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to view tokens',
      }
    }

    // 3. Get tokens
    const tokens = await db.eventInviteToken.findMany({
      where: {
        contactId,
        groupId,
        expiresAt: {
          gte: new Date(), // Only active tokens
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: tokens,
    }
  } catch (error) {
    console.error('Failed to get contact tokens:', error)
    return {
      success: false,
      error: 'Failed to load tokens',
    }
  }
}

/**
 * Revoke an event invite token (admin only)
 * 
 * @param tokenId - The token ID to revoke
 * @returns Object with success status or error message
 */
export async function revokeEventInviteToken(tokenId: string) {
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

    // 2. Get token
    const token = await db.eventInviteToken.findUnique({
      where: { id: tokenId },
    })

    if (!token) {
      return {
        success: false,
        error: 'Token not found',
      }
    }

    // 3. Check permissions
    const contact = await db.contact.findUnique({
      where: { id: token.contactId },
      include: {
        memberships: {
          where: {
            groupId: token.groupId,
          },
          include: {
            group: true,
          },
        },
      },
    })

    if (!contact) {
      return {
        success: false,
        error: 'Contact not found',
      }
    }

    const membership = contact.memberships[0]
    if (!membership || membership.group.ownerId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to revoke this token',
      }
    }

    // 4. Revoke token by setting expiration to now
    await db.eventInviteToken.update({
      where: { id: tokenId },
      data: {
        expiresAt: new Date(),
      },
    })

    // 5. Create audit log
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        groupId: token.groupId,
        method: 'UPDATE',
        entity: 'EventInviteToken',
        entityId: tokenId,
        diffJson: {
          action: 'revoke',
        },
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to revoke token:', error)
    return {
      success: false,
      error: 'Failed to revoke token',
    }
  }
}

