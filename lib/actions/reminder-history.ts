'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { z } from 'zod'
import { startOfDay, endOfDay, subDays } from 'date-fns'

/**
 * Get reminder history for a group
 * Shows all scheduled sends with their delivery status
 */
export async function getReminderHistory(params: {
  groupId: string
  status?: 'ALL' | 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED'
  channel?: 'ALL' | 'EMAIL' | 'SMS'
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Check if user is a member of the group
    const membership = await db.membership.findFirst({
      where: {
        groupId: params.groupId,
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return {
        success: false,
        error: 'You are not a member of this group',
      }
    }

    // Build where clause
    const where: any = {
      event: {
        contact: {
          memberships: {
            some: {
              groupId: params.groupId,
            },
          },
        },
      },
    }

    // Filter by status
    if (params.status && params.status !== 'ALL') {
      where.status = params.status
    }

    // Filter by channel
    if (params.channel && params.channel !== 'ALL') {
      where.channel = params.channel
    }

    // Filter by date range
    if (params.dateFrom || params.dateTo) {
      where.dueAtUtc = {}
      if (params.dateFrom) {
        where.dueAtUtc.gte = startOfDay(params.dateFrom)
      }
      if (params.dateTo) {
        where.dueAtUtc.lte = endOfDay(params.dateTo)
      }
    }

    // Get total count
    const total = await db.scheduledSend.count({ where })

    // Get paginated results
    const reminders = await db.scheduledSend.findMany({
      where,
      include: {
        event: {
          include: {
            contact: true,
          },
        },
        sendLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        dueAtUtc: 'desc',
      },
      take: params.limit || 50,
      skip: params.offset || 0,
    })

    return {
      success: true,
      reminders,
      total,
      limit: params.limit || 50,
      offset: params.offset || 0,
    }
  } catch (error) {
    console.error('Failed to get reminder history:', error)
    return {
      success: false,
      error: 'Failed to get reminder history',
    }
  }
}

/**
 * Get reminder statistics for a group
 */
export async function getReminderStats(groupId: string) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Check if user is a member of the group
    const membership = await db.membership.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return {
        success: false,
        error: 'You are not a member of this group',
      }
    }

    // Base where clause for this group
    const baseWhere = {
      event: {
        contact: {
          memberships: {
            some: {
              groupId,
            },
          },
        },
      },
    }

    // Get counts by status
    const [
      totalScheduled,
      totalPending,
      totalSent,
      totalDelivered,
      totalFailed,
      recentActivity,
    ] = await Promise.all([
      // Total scheduled
      db.scheduledSend.count({
        where: baseWhere,
      }),
      // Pending
      db.scheduledSend.count({
        where: {
          ...baseWhere,
          status: 'PENDING',
        },
      }),
      // Sent
      db.scheduledSend.count({
        where: {
          ...baseWhere,
          status: { in: ['SENT', 'DELIVERED'] },
        },
      }),
      // Delivered
      db.scheduledSend.count({
        where: {
          ...baseWhere,
          status: 'DELIVERED',
        },
      }),
      // Failed
      db.scheduledSend.count({
        where: {
          ...baseWhere,
          status: 'FAILED',
        },
      }),
      // Recent activity (last 30 days)
      db.scheduledSend.findMany({
        where: {
          ...baseWhere,
          sentAt: {
            gte: subDays(new Date(), 30),
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
          sentAt: 'desc',
        },
        take: 10,
      }),
    ])

    // Calculate success rate
    const successRate =
      totalSent + totalFailed > 0
        ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
        : '0'

    return {
      success: true,
      stats: {
        totalScheduled,
        totalPending,
        totalSent,
        totalDelivered,
        totalFailed,
        successRate,
        recentActivity,
      },
    }
  } catch (error) {
    console.error('Failed to get reminder stats:', error)
    return {
      success: false,
      error: 'Failed to get reminder stats',
    }
  }
}

/**
 * Retry a failed reminder
 */
const retryReminderSchema = z.object({
  scheduledSendId: z.string().min(1, 'Scheduled send ID is required'),
})

export async function retryFailedReminder(scheduledSendId: string) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Validate input
    const validation = retryReminderSchema.safeParse({ scheduledSendId })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      }
    }

    // Get the scheduled send
    const scheduledSend = await db.scheduledSend.findUnique({
      where: { id: scheduledSendId },
      include: {
        event: {
          include: {
            contact: {
              include: {
                memberships: {
                  where: {
                    userId: session.user.id,
                    status: 'ACTIVE',
                  },
                  include: {
                    group: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!scheduledSend) {
      return {
        success: false,
        error: 'Scheduled send not found',
      }
    }

    // Check if user has access (is a member of the group)
    if (scheduledSend.event.contact.memberships.length === 0) {
      return {
        success: false,
        error: 'You do not have access to this reminder',
      }
    }

    // Check if reminder can be retried
    if (scheduledSend.status !== 'FAILED') {
      return {
        success: false,
        error: 'Only failed reminders can be retried',
      }
    }

    if (scheduledSend.retryCount >= 3) {
      return {
        success: false,
        error: 'Maximum retry attempts reached (3)',
      }
    }

    // Reset status to PENDING for retry
    await db.scheduledSend.update({
      where: { id: scheduledSendId },
      data: {
        status: 'PENDING',
        failedAt: null,
      },
    })

    return {
      success: true,
      message: 'Reminder queued for retry',
    }
  } catch (error) {
    console.error('Failed to retry reminder:', error)
    return {
      success: false,
      error: 'Failed to retry reminder',
    }
  }
}

/**
 * Get reminder history for a specific event
 */
export async function getEventReminderHistory(eventId: string) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get reminders for this event
    const reminders = await db.scheduledSend.findMany({
      where: {
        eventId,
        event: {
          contact: {
            memberships: {
              some: {
                userId: session.user.id,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      include: {
        event: {
          include: {
            contact: true,
          },
        },
        sendLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        dueAtUtc: 'desc',
      },
    })

    return {
      success: true,
      reminders,
    }
  } catch (error) {
    console.error('Failed to get event reminder history:', error)
    return {
      success: false,
      error: 'Failed to get event reminder history',
    }
  }
}

