import { db } from '@/lib/db'
import { addDays, addYears, format, startOfDay } from 'date-fns'
import { ChannelType, SendStatus } from '@prisma/client'
import { getTemporalClient } from '@/temporal/client'
import type { ReminderInput } from '@/temporal/workflows/reminder.workflow'
import { Temporal } from '@js-temporal/polyfill'

const LOOKAHEAD_DAYS = 30
const DEFAULT_TIMEZONE = 'UTC'
const USE_TEMPORAL =
  process.env.USE_TEMPORAL === 'true' && process.env.NODE_ENV !== 'test'

interface Recipient {
  userId: string
  email: string
  phone: string | null
  name: string
  timezone: string
}

/**
 * Schedule a reminder using Temporal workflows
 */
async function scheduleReminderWithTemporal(params: {
  idempotencyKey: string
  event: any
  eventName: string
  eventDate: Date
  offset: number
  channel: ChannelType
  recipient: Recipient
  groupName: string
  daysBeforeEvent: number
}): Promise<void> {
  const { idempotencyKey, event, eventName, eventDate, offset, channel, recipient, groupName, daysBeforeEvent } = params
  
  // Prepare workflow input
  const input: ReminderInput = {
    eventId: event.id,
    eventName,
    eventDate,
    recipientEmail: recipient.email,
    recipientName: recipient.name,
    groupName,
    daysBeforeEvent,
    channels: [channel],
  }
  
  // Add phone if available
  if (recipient.phone) {
    input.recipientPhone = recipient.phone
  }
  
  const client = await getTemporalClient()
  
  // Start workflow with idempotent workflow ID
  const workflowId = `reminder-${idempotencyKey}`
  
  try {
    await client.workflow.start('reminderWorkflow', {
      taskQueue: 'circleday-tasks',
      workflowId,
      args: [input],
    })
    console.log(`✅ Started Temporal workflow: ${workflowId}`)
  } catch (error: any) {
    if (error?.name === 'WorkflowExecutionAlreadyStartedError') {
      console.log(`ℹ️ Workflow already exists: ${workflowId}`)
    } else {
      throw error
    }
  }
}

/**
 * Calculate the next occurrence of an event (for recurring events like birthdays)
 */
function calculateNextOccurrence(eventDate: Date, yearKnown: boolean): Date {
  const today = startOfDay(new Date())
  const eventMonth = eventDate.getMonth()
  const eventDay = eventDate.getDate()
  
  let nextDate = new Date(today.getFullYear(), eventMonth, eventDay)
  
  if (nextDate < today) {
    nextDate = addYears(nextDate, 1)
  }
  
  return nextDate
}

/**
 * Build a Date instance in UTC representing the chosen timezone + hour
 */
function buildZonedDate(date: Date, timezone: string, hour: number, dayOffset: number = 0): Date {
  const zonedDate = Temporal.ZonedDateTime.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
    timeZone: timezone,
    calendar: 'iso8601',
  }).add({ days: dayOffset })

  return new Date(zonedDate.toInstant().epochMilliseconds)
}

/**
 * Generate a unique idempotency key for a scheduled send
 */
function generateIdempotencyKey(
  eventId: string,
  targetDate: Date,
  offset: number,
  channel: ChannelType,
  recipientIdentifier: string
): string {
  const datePart = format(targetDate, 'yyyyMMddHHmm')
  return `${eventId}-${datePart}-${offset}-${channel}-${recipientIdentifier}`
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
 * This creates ScheduledSend records for analytics and starts Temporal workflows
 */
export async function scheduleUpcomingReminders(): Promise<{
  scheduled: number
  skipped: number
  errors: number
}> {
  const today = startOfDay(new Date())
  const deadline = addDays(today, LOOKAHEAD_DAYS)
  
  let scheduled = 0
  let skipped = 0
  let errors = 0

  try {
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

    const dedupedReminders = new Set<string>()

    for (const rule of rules) {
      const events = rule.group.memberships
        .flatMap(m => m.contact.events)
        .filter(e => !e.deletedAt)

      for (const event of events) {
        const nextOccurrence = event.repeat
          ? calculateNextOccurrence(event.date, event.yearKnown)
          : event.date

        for (const offset of rule.offsets) {
          const channelsData = rule.channels as Record<string, string[]>
          const channels = channelsData?.[offset.toString()] || []
          if (channels.length === 0) continue

          const sendWindow = addDays(nextOccurrence, offset)
          if (sendWindow < today || sendWindow > deadline) continue

          const recipients: Recipient[] = []
          if (rule.group.type === 'PERSONAL') {
            const ownerMembership = rule.group.memberships.find(
              m => m.userId === rule.group.ownerId && m.user
            )
            if (ownerMembership?.user) {
              recipients.push({
                userId: ownerMembership.user.id,
                email: ownerMembership.user.email,
                phone: ownerMembership.user.phone,
                name: ownerMembership.user.name || ownerMembership.user.email || 'CircleDay member',
                timezone: ownerMembership.user.defaultTimezone || rule.group.defaultTimezone || DEFAULT_TIMEZONE,
              })
            }
          } else {
            for (const membership of rule.group.memberships) {
              if (!membership.user) continue
              if (membership.contactId === event.contactId) continue
              recipients.push({
                userId: membership.user.id,
                email: membership.user.email,
                phone: membership.user.phone,
                name: membership.user.name || membership.user.email || 'CircleDay member',
                timezone: membership.user.defaultTimezone || rule.group.defaultTimezone || DEFAULT_TIMEZONE,
              })
            }
          }

          if (recipients.length === 0) continue

          const eventContact = rule.group.memberships.find(m => m.contactId === event.contactId)?.contact
          const eventDisplayName = event.title || `${eventContact?.name || 'Celebration'} ${event.type}`

          for (const recipient of recipients) {
            for (const channelStr of channels) {
              const channel = channelStr as ChannelType

              const recipientIdentifier =
                channel === 'EMAIL' ? recipient.email :
                channel === 'SMS' ? recipient.phone :
                null

              if (!recipientIdentifier) {
                skipped++
                continue
              }

              if (await isSuppressed(recipientIdentifier, channel)) {
                skipped++
                continue
              }

              const dueAtUtc = buildZonedDate(nextOccurrence, recipient.timezone, rule.sendHour, offset)
              if (dueAtUtc < today || dueAtUtc > deadline) {
                continue
              }

              const idempotencyKey = generateIdempotencyKey(
                event.id,
                dueAtUtc,
                offset,
                channel,
                recipientIdentifier
              )

              if (dedupedReminders.has(idempotencyKey)) {
                continue
              }
              dedupedReminders.add(idempotencyKey)

              const eventDateForWorkflow = buildZonedDate(nextOccurrence, recipient.timezone, rule.sendHour)

              try {
                if (USE_TEMPORAL) {
                  await scheduleReminderWithTemporal({
                    idempotencyKey,
                    event,
                    eventName: eventDisplayName,
                    eventDate: eventDateForWorkflow,
                    offset,
                    channel,
                    recipient,
                    groupName: rule.group.name,
                    daysBeforeEvent: Math.abs(offset),
                  })
                }

                await db.scheduledSend.upsert({
                  where: { idempotencyKey },
                  create: {
                    eventId: event.id,
                    recipientUserId: recipient.userId,
                    targetDate: nextOccurrence,
                    offset,
                    channel,
                    dueAtUtc,
                    status: 'PENDING',
                    idempotencyKey,
                  },
                  update: {
                    dueAtUtc,
                    recipientUserId: recipient.userId,
                    offset,
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

  // Get all pending scheduled sends for today
  // Note: We filter by remindersEnabled in the scheduler when creating these
  return await db.scheduledSend.findMany({
    where: {
      dueAtUtc: {
        gte: today,
        lt: endOfDay,
      },
      status: {
        in: ['PENDING', 'QUEUED'],
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
  // Get failed sends that should be retried
  // Note: We filter by remindersEnabled in the scheduler when creating these
  return await db.scheduledSend.findMany({
    where: {
      status: 'FAILED',
      retryCount: {
        lt: maxRetries,
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

