import { addHours } from 'date-fns'
import { SendStatus, ScheduledSend } from '@prisma/client'
import { db } from '@/lib/db'
import { getTemporalClient } from '@/temporal/client'

export type ReminderDiscrepancy = {
  scheduledSendId: string
  idempotencyKey: string
  type: 'missing-workflow' | 'workflow-error'
  workflowStatus?: string
  details: string
}

export type ReconcileOptions = {
  limit?: number
  windowHours?: number
  statuses?: SendStatus[]
  groupId?: string
}

/**
 * Compare ScheduledSend rows with Temporal workflows to surface missing or failed executions.
 */
export async function reconcileScheduledSends(options: ReconcileOptions = {}) {
  const limit = options.limit ?? 100
  const windowHours = options.windowHours ?? 48
  const statuses = options.statuses ?? ['PENDING', 'QUEUED', 'FAILED']
  const groupId = options.groupId

  const now = new Date()
  const windowStart = addHours(now, -windowHours)

  const where: any = {
    dueAtUtc: {
      gte: windowStart,
      lte: now,
    },
    status: {
      in: statuses,
    },
  }

  if (groupId) {
    where.event = {
      contact: {
        memberships: {
          some: {
            groupId,
          },
        },
      },
    }
  }

  const scheduledSends = await db.scheduledSend.findMany({
    where,
    orderBy: {
      dueAtUtc: 'asc',
    },
    take: limit,
  })

  const client = await getTemporalClient()
  const discrepancies: ReminderDiscrepancy[] = []

  for (const send of scheduledSends) {
    const workflowId = `reminder-${send.idempotencyKey}`
    try {
      const handle = client.workflow.getHandle(workflowId)
      const description = await handle.describe()
      const workflowStatus = description?.status?.name

      if (workflowStatus && ['FAILED', 'TERMINATED', 'CANCELED'].includes(workflowStatus)) {
        discrepancies.push({
          scheduledSendId: send.id,
          idempotencyKey: send.idempotencyKey,
          type: 'workflow-error',
          workflowStatus,
          details: `Workflow has status ${workflowStatus}`,
        })
      }
    } catch (error: any) {
      if (error?.name === 'WorkflowNotFoundError') {
        discrepancies.push({
          scheduledSendId: send.id,
          idempotencyKey: send.idempotencyKey,
          type: 'missing-workflow',
          details: 'Workflow could not be found in Temporal',
        })
      } else {
        console.error(`Failed to describe workflow ${workflowId}:`, error)
      }
    }
  }

  return {
    windowStart,
    windowEnd: now,
    checked: scheduledSends.length,
    discrepancies,
  }
}

