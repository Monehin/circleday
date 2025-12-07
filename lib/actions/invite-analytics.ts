import { db } from '@/lib/db'
import { ensureGroupAccess } from '@/lib/actions/group-access'

export async function getGroupInviteAnalytics(groupId: string) {
  const access = await ensureGroupAccess(groupId)

  if (!access.success) {
    return { success: false, error: access.error }
  }

  const now = new Date()

  const tokens = await db.eventInviteToken.findMany({
    where: { groupId },
    select: {
      createdAt: true,
      usedAt: true,
      useCount: true,
      expiresAt: true,
      maxUses: true,
    },
  })

  const totalTokens = tokens.length
  const usedTokens = tokens.filter(t => t.useCount > 0)
  const expiredTokens = tokens.filter(t => t.expiresAt < now)
  const pendingTokens = tokens.filter(t => t.useCount === 0 && t.expiresAt >= now)

  const avgUseDelayMinutes =
    usedTokens.length === 0
      ? 0
      : Math.round(
          usedTokens.reduce((sum, token) => {
            const usedAt = token.usedAt ?? new Date()
            return sum + Math.max(0, (usedAt.getTime() - token.createdAt.getTime()) / 1000 / 60)
          }, 0) / usedTokens.length
        )

  const conversionRate = totalTokens === 0 ? 0 : Math.round((usedTokens.length / totalTokens) * 100)

  return {
    success: true,
    stats: {
      totalTokens,
      usedTokens: usedTokens.length,
      expiredTokens: expiredTokens.length,
      pendingTokens: pendingTokens.length,
      conversionRate,
      avgUseDelayMinutes,
    },
  }
}

