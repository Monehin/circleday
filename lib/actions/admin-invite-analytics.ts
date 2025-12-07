import { addDays } from 'date-fns'
import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

type Metrics = {
  totalTokens: number
  usedTokens: number
  expiredTokens: number
  pendingTokens: number
  conversionRate: number
  avgUseDelayMinutes: number
  scheduledNextWeek: number
  suppressionCount: number
}

export async function getAdminInviteAnalytics() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const memberships = await db.membership.findMany({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
      role: {
        in: ['OWNER', 'ADMIN'],
      },
    },
    include: {
      group: true,
    },
  })

  if (memberships.length === 0) {
    return { success: false, error: 'No admin groups found' }
  }

  const groupIds = memberships.map(m => m.groupId)
  const metrics = await computeGroupMetrics(groupIds)

  return {
    success: true,
    data: memberships.map(m => ({
      groupId: m.groupId,
      groupName: m.group.name,
      ...metrics[m.groupId],
    })),
  }
}

async function computeGroupMetrics(groupIds: string[]): Promise<Record<string, Metrics>> {
  const now = new Date()
  const nextWeek = addDays(now, 7)

  const tokens = await db.eventInviteToken.findMany({
    where: {
      groupId: { in: groupIds },
    },
    select: {
      groupId: true,
      createdAt: true,
      usedAt: true,
      useCount: true,
      expiresAt: true,
    },
  })

  const metrics: Record<string, Metrics> = {}
  await Promise.all(
    groupIds.map(async (groupId, index) => {
      const groupTokens = tokens.filter(token => token.groupId === groupId)
      const usedTokens = groupTokens.filter(token => token.useCount > 0)
      const expiredTokens = groupTokens.filter(token => token.expiresAt < now)
      const pendingTokens = groupTokens.filter(
        token => token.useCount === 0 && token.expiresAt >= now
      )
      const avgUseDelayMinutes =
        usedTokens.length === 0
          ? 0
          : Math.round(
              usedTokens.reduce(
                (sum, token) =>
                  sum +
                  Math.max(
                    0,
                    ((token.usedAt?.getTime() ?? now.getTime()) - token.createdAt.getTime()) / 1000 / 60
                  ),
                0
              ) / usedTokens.length
            )
      const conversionRate =
        groupTokens.length === 0 ? 0 : Math.round((usedTokens.length / groupTokens.length) * 100)

      const scheduledNextWeek = await db.scheduledSend.count({
        where: {
          event: {
            contact: {
              memberships: {
                some: {
                  groupId,
                },
              },
            },
          },
          dueAtUtc: {
            gte: now,
            lte: nextWeek,
          },
        },
      })

      const memberships = await db.membership.findMany({
        where: {
          groupId,
          status: 'ACTIVE',
        },
        include: {
          user: true,
        },
      })

      const identifiers = Array.from(
        new Set(
          memberships.flatMap(m => {
            const email = m.user?.email?.toLowerCase()
            const phone = m.user?.phone?.replace(/\D/g, '')
            return [email, phone].filter(Boolean) as string[]
          })
        )
      )

      const suppressionCount =
        identifiers.length === 0
          ? 0
          : await db.suppression.count({
              where: {
                identifier: {
                  in: identifiers,
                },
              },
            })

      metrics[groupId] = {
        totalTokens: groupTokens.length,
        usedTokens: usedTokens.length,
        expiredTokens: expiredTokens.length,
        pendingTokens: pendingTokens.length,
        conversionRate,
        avgUseDelayMinutes,
        scheduledNextWeek,
        suppressionCount,
      }
    })
  )

  return metrics
}

