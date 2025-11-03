import { db } from '@/lib/db'
import { startOfDay, addYears, differenceInDays, parseISO, format } from 'date-fns'

export type ReminderToSend = {
  ruleId: string
  groupId: string
  groupName: string
  eventId: string
  eventType: string
  eventTitle: string | null
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  eventDate: Date
  nextOccurrence: Date
  daysUntil: number
  offset: number
  channels: string[]
  sendHour: number
  recipientEmail: string
  recipientName: string
  recipientTimezone: string
}

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
 * Calculate all reminders that should be sent today
 * This function is called by the daily cron job
 */
export async function calculateRemindersForToday(): Promise<ReminderToSend[]> {
  const today = startOfDay(new Date())
  const reminders: ReminderToSend[] = []

  try {
    // Get all active reminder rules with their groups, events, and members
    const rules = await db.reminderRule.findMany({
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

        // Calculate days until the event
        const daysUntil = differenceInDays(nextOccurrence, today)

        // Check if any of the rule's offsets match
        for (const offset of rule.offsets) {
          if (daysUntil === Math.abs(offset)) {
            // Get channels for this offset
            const channelsData = rule.channels as Record<string, string[]>
            const channels = channelsData?.[offset.toString()] || []

            if (channels.length === 0) continue

            // Get all group members who should receive this reminder
            for (const membership of rule.group.memberships) {
              if (!membership.user) continue // Skip if no user linked

              // Only send email reminders for now (SMS requires Twilio setup)
              if (channels.includes('EMAIL') && membership.user.email) {
                reminders.push({
                  ruleId: rule.id,
                  groupId: rule.groupId,
                  groupName: rule.group.name,
                  eventId: event.id,
                  eventType: event.type,
                  eventTitle: event.title,
                  contactName: membership.contact.name,
                  contactEmail: membership.contact.email,
                  contactPhone: membership.contact.phone,
                  eventDate: event.date,
                  nextOccurrence,
                  daysUntil,
                  offset,
                  channels,
                  sendHour: rule.sendHour,
                  recipientEmail: membership.user.email,
                  recipientName: membership.user.name || membership.user.email,
                  recipientTimezone: membership.user.defaultTimezone || 'UTC',
                })
              }
            }
          }
        }
      }
    }

    return reminders
  } catch (error) {
    console.error('Failed to calculate reminders:', error)
    throw error
  }
}

/**
 * Get reminder statistics for monitoring
 */
export async function getReminderStats() {
  try {
    const [totalRules, totalEvents, scheduledToday] = await Promise.all([
      db.reminderRule.count(),
      db.event.count({
        where: {
          deletedAt: null,
        },
      }),
      calculateRemindersForToday().then(reminders => reminders.length),
    ])

    return {
      totalRules,
      totalEvents,
      scheduledToday,
    }
  } catch (error) {
    console.error('Failed to get reminder stats:', error)
    throw error
  }
}

