import { addDays } from 'date-fns'
import { db } from '@/lib/db'
import { ensureGroupAccess } from '@/lib/actions/group-access'
import { reconcileScheduledSends } from '@/lib/services/reminder-reconciliation'

type HealthResponse =
  | {
      success: true
    health: {
      remindersEnabled: boolean
      scheduledCounts: {
        total: number
        pending: number
        queued: number
        failed: number
      }
      latestScheduledSend: {
        dueAtUtc: Date
        status: string
      } | null
      reconciliation: {
        windowStart: Date
        windowEnd: Date
        discrepancyCount: number
        discrepancies: { scheduledSendId: string; details: string; type: string }[]
      }
      engagement?: {
        since: Date
        counts: Record<string, number>
      }
    }
    }
  | {
      success: false
      error: string
    }

export async function getGroupReminderHealth(groupId: string): Promise<HealthResponse> {
  const access = await ensureGroupAccess(groupId)

  if (!access.success) {
    return { success: false, error: access.error }
  }

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

  const [totalScheduled, pending, queued, failed, latestScheduled] = await Promise.all([
    db.scheduledSend.count({ where: baseWhere }),
    db.scheduledSend.count({
      where: {
        ...baseWhere,
        status: 'PENDING',
      },
    }),
    db.scheduledSend.count({
      where: {
        ...baseWhere,
        status: 'QUEUED',
      },
    }),
    db.scheduledSend.count({
      where: {
        ...baseWhere,
        status: 'FAILED',
      },
    }),
    db.scheduledSend.findFirst({
      where: baseWhere,
      orderBy: {
        dueAtUtc: 'desc',
      },
      select: {
        dueAtUtc: true,
        status: true,
      },
    }),
  ])

  const reconciliation = await reconcileScheduledSends({
    groupId,
    windowHours: 24,
    limit: 50,
  })
  const pastWeek = addDays(new Date(), -7)

  const engagementGroups = await db.sendLog.groupBy({
    by: ['status'],
    where: {
      scheduledSend: {
        event: {
          contact: {
            memberships: {
              some: {
                groupId,
              },
            },
          },
        },
      },
      createdAt: {
        gte: pastWeek,
      },
    },
    _count: {
      id: true,
    },
  })

  const engagementCounts: Record<string, number> = {}
  engagementGroups.forEach(group => {
    engagementCounts[group.status] = group._count.id
  })

  return {
    success: true,
    health: {
      remindersEnabled: !!access.group?.remindersEnabled,
      scheduledCounts: {
        total: totalScheduled,
        pending,
        queued,
        failed,
      },
      latestScheduledSend: latestScheduled,
      reconciliation: {
        windowStart: reconciliation.windowStart,
        windowEnd: reconciliation.windowEnd,
        discrepancyCount: reconciliation.discrepancies.length,
        discrepancies: reconciliation.discrepancies.map(d => ({
          scheduledSendId: d.scheduledSendId,
          details: d.details,
          type: d.type,
        })),
      },
      engagement: {
        since: pastWeek,
        counts: engagementCounts,
      },
    },
  }
}

