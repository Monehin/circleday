import { db } from '@/lib/db'
import { getTemporalClient } from '@/temporal/client'
import { ScheduledSend } from '@prisma/client'

/**
 * Provide counts for each reminder status for dashboards.
 */
export async function getReminderStatusCounts() {
  const [pending, queued, sent, delivered, failed] = await Promise.all([
    db.scheduledSend.count({ where: { status: 'PENDING' } }),
    db.scheduledSend.count({ where: { status: 'QUEUED' } }),
    db.scheduledSend.count({ where: { status: 'SENT' } }),
    db.scheduledSend.count({ where: { status: 'DELIVERED' } }),
    db.scheduledSend.count({ where: { status: 'FAILED' } }),
  ])

  return { pending, queued, sent, delivered, failed }
}

/**
 * Provide recent sends and timezone drift metrics.
 */
export async function getReminderMetrics() {
  const recentSends = await db.scheduledSend.findMany({
    where: {
      sentAt: { not: null },
      status: { in: ['SENT', 'DELIVERED'] },
    },
    take: 12,
    orderBy: { sentAt: 'desc' },
    include: {
      event: {
        include: {
          contact: true,
        },
      },
      sendLogs: true,
    },
  })

  const totalDriftMs = recentSends.reduce((total, row) => {
    if (!row.sentAt) return total
    return total + Math.abs(row.sentAt.getTime() - row.dueAtUtc.getTime())
  }, 0)

  return {
    averageDriftMinutes: recentSends.length ? totalDriftMs / recentSends.length / 1000 / 60 : 0,
    recentSends,
  }
}

/**
 * Get reminder send history for a specific event.
 */
export async function getReminderHistory(eventId: string) {
  try {
    const scheduledSends = await db.scheduledSend.findMany({
      where: { eventId },
      include: {
        sendLogs: true,
        event: {
          include: {
            contact: true,
          },
        },
      },
      orderBy: {
        dueAtUtc: 'desc',
      },
    })

    return {
      success: true,
      logs: scheduledSends,
    }
  } catch (error) {
    console.error('Failed to get reminder history:', error)
    return {
      success: false,
      logs: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get reminder sending stats for dashboards.
 */
export async function getReminderSendingStats() {
  try {
    const [totalSent, totalFailed] = await Promise.all([
      db.scheduledSend.count({
        where: { status: { in: ['SENT', 'DELIVERED'] } },
      }),
      db.scheduledSend.count({
        where: { status: 'FAILED' },
      }),
    ])

    const successRate =
      totalSent + totalFailed > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) : '0'

    return {
      success: true,
      stats: {
        totalSent,
        totalFailed,
        successRate,
      },
    }
  } catch (error) {
    console.error('Failed to get reminder stats:', error)
    return {
      success: false,
      stats: {
        totalSent: 0,
        totalFailed: 0,
        successRate: '0',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Describe the Temporal workflow tied to a scheduled send.
 */
export async function describeReminderWorkflow(scheduledSendId: string) {
  const scheduledSend = await db.scheduledSend.findUnique({
    where: { id: scheduledSendId },
    select: {
      idempotencyKey: true,
    },
  })

  if (!scheduledSend) {
    return null
  }

  try {
    const client = await getTemporalClient()
    const handle = client.workflow.getHandle(`reminder-${scheduledSend.idempotencyKey}`)
    return await handle.describe()
  } catch (error) {
    console.error('Failed to describe Temporal workflow:', error)
    return null
  }
}

