import { db } from '@/lib/db'
import { startOfDay, addYears, differenceInDays, addDays, format } from 'date-fns'
import { ChannelType, SendStatus } from '@prisma/client'

/**
 * Calculate the next occurrence of an event (for recurring events like birthdays)
 */
function calculateNextOccurrence(eventDate: Date, yearKnown: boolean): Date {
  const today = startOfDay(new Date())
  const eventMonth = eventDate.getMonth()
  const eventDay = eventDate.getDate()
  
  // Create date for this year
  let nextDate = new Date(today.getFullYear(), eventMonth, eventDay)
  
  // If the date has passed this year, use next year
  if (nextDate < today) {
    nextDate = addYears(nextDate, 1)
  }
  
  return nextDate
}

/**
 * Generate a unique idempotency key for a scheduled send
 */
function generateIdempotencyKey(
  eventId: string,
  targetDate: Date,
  offset: number,
  channel: ChannelType,
  recipientEmail: string
): string {
  const datePart = format(targetDate, 'yyyy-MM-dd')
  return `${eventId}-${datePart}-${offset}-${channel}-${recipientEmail}`
}

/**
 * Check if an identifier (email/phone) is suppressed
 */
async function isSuppressed(identifier: string, channel: ChannelType): Promise<boolean> {
  const suppression = await db.suppression.findUnique({
    where: {
      identifier_channel: {
        identifier,
        channel,
      },
    },
  })
  return !!suppression
}

/**
 * Schedule reminders for events in the next 30 days
 * This creates ScheduledSend records that will be processed by the sender
 */
export async function scheduleUpcomingReminders(): Promise<{
  scheduled: number
  skipped: number
  errors: number
}> {
  const today = startOfDay(new Date())
  const endDate = addDays(today, 30) // Look ahead 30 days
  
  let scheduled = 0
  let skipped = 0
  let errors = 0

  try {
    // Get all active reminder rules with their groups, events, and members
    // Only process groups where reminders are enabled
    const rules = await db.reminderRule.findMany({
      where: {
        group: {
          remindersEnabled: true,
          deletedAt: null,
        },
      },
      include: {
        group: {
          include: {
            memberships: {
              where: {
                status: 'ACTIVE',
              },
              include: {
                user: true,
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
            },
          },
        },
      },
    })

    // For each rule, check which events match the reminder offsets
    for (const rule of rules) {
      // Get all events from group members (filter out deleted events)
      const events = rule.group.memberships
        .flatMap(m => m.contact.events)
        .filter(e => !e.deletedAt)

      for (const event of events) {
        // Calculate next occurrence for recurring events
        const nextOccurrence = event.repeat 
          ? calculateNextOccurrence(event.date, event.yearKnown)
          : event.date

        // Only process events within our look-ahead window
        if (nextOccurrence > endDate) continue

        // Check if any of the rule's offsets match within our window
        for (const offset of rule.offsets) {
          const sendDate = addDays(nextOccurrence, offset) // offset is negative, so this subtracts
          
          // Only schedule if send date is within our window
          if (sendDate < today || sendDate > endDate) continue

          // Get channels for this offset
          const channelsData = rule.channels as Record<string, string[]>
          const channels = channelsData?.[offset.toString()] || []

          if (channels.length === 0) continue

          // Get all group members who should receive this reminder
          for (const membership of rule.group.memberships) {
            if (!membership.user) continue // Skip if no user linked

            // Process each channel (EMAIL, SMS)
            for (const channelStr of channels) {
              const channel = channelStr as ChannelType

              // Determine recipient based on channel
              let recipientIdentifier: string | null = null
              if (channel === 'EMAIL' && membership.user.email) {
                recipientIdentifier = membership.user.email
              } else if (channel === 'SMS' && membership.user.phone) {
                recipientIdentifier = membership.user.phone
              }

              if (!recipientIdentifier) {
                skipped++
                continue
              }

              // Check suppression list
              if (await isSuppressed(recipientIdentifier, channel)) {
                skipped++
                continue
              }

              // Generate idempotency key
              const idempotencyKey = generateIdempotencyKey(
                event.id,
                nextOccurrence,
                offset,
                channel,
                recipientIdentifier
              )

              try {
                // Create or skip if already exists (idempotency)
                await db.scheduledSend.upsert({
                  where: { idempotencyKey },
                  create: {
                    eventId: event.id,
                    targetDate: nextOccurrence,
                    offset,
                    channel,
                    dueAtUtc: sendDate,
                    status: 'PENDING',
                    idempotencyKey,
                  },
                  update: {
                    // If already exists and not sent, update due date in case rule changed
                    dueAtUtc: sendDate,
                  },
                })
                scheduled++
              } catch (error) {
                console.error('Failed to schedule reminder:', error)
                errors++
              }
            }
          }
        }
      }
    }

    return { scheduled, skipped, errors }
  } catch (error) {
    console.error('Failed to schedule reminders:', error)
    throw error
  }
}

/**
 * Get pending scheduled sends for today
 */
export async function getPendingScheduledSendsForToday() {
  const today = startOfDay(new Date())
  const endOfDay = addDays(today, 1)

  return await db.scheduledSend.findMany({
    where: {
      dueAtUtc: {
        gte: today,
        lt: endOfDay,
      },
      status: {
        in: ['PENDING', 'QUEUED'],
      },
      reminderRule: {
        group: {
          remindersEnabled: true,
          deletedAt: null,
        },
      },
    },
    include: {
      event: {
        include: {
          contact: true,
        },
      },
    },
    orderBy: {
      dueAtUtc: 'asc',
    },
  })
}

/**
 * Get failed sends that should be retried
 */
export async function getFailedSendsToRetry(maxRetries: number = 3) {
  return await db.scheduledSend.findMany({
    where: {
      status: 'FAILED',
      retryCount: {
        lt: maxRetries,
      },
      reminderRule: {
        group: {
          remindersEnabled: true,
          deletedAt: null,
        },
      },
    },
    include: {
      event: {
        include: {
          contact: true,
        },
      },
    },
    orderBy: {
      failedAt: 'asc',
    },
    take: 100, // Process 100 retries at a time
  })
}

/**
 * Get reminder statistics for monitoring
 */
export async function getSchedulerStats() {
  try {
    const [
      totalPending,
      totalSent,
      totalFailed,
      totalRetrying,
      recentSends,
    ] = await Promise.all([
      db.scheduledSend.count({
        where: { status: 'PENDING' },
      }),
      db.scheduledSend.count({
        where: { status: { in: ['SENT', 'DELIVERED'] } },
      }),
      db.scheduledSend.count({
        where: { status: 'FAILED' },
      }),
      db.scheduledSend.count({
        where: {
          status: 'FAILED',
          retryCount: { gt: 0 },
        },
      }),
      db.scheduledSend.findMany({
        where: {
          sentAt: {
            gte: addDays(new Date(), -7),
          },
        },
        take: 100,
        orderBy: {
          sentAt: 'desc',
        },
        include: {
          event: {
            include: {
              contact: true,
            },
          },
          sendLogs: true,
        },
      }),
    ])

    return {
      totalPending,
      totalSent,
      totalFailed,
      totalRetrying,
      recentSends,
    }
  } catch (error) {
    console.error('Failed to get scheduler stats:', error)
    throw error
  }
}

