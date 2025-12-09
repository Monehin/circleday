import { getAdminInviteAnalytics } from '@/lib/actions/admin-invite-analytics'

const WEBHOOK = process.env.INVITE_ANALYTICS_SLACK_WEBHOOK
const THRESHOLD = Number(process.env.INVITE_CONVERSION_ALERT_THRESHOLD) || 25
const MIN_TOKENS = Number(process.env.INVITE_CONVERSION_MIN_TOKENS) || 5
const TOP_N = Number(process.env.INVITE_CONVERSION_ALERT_TOP_N) || 3

export async function alertLowInviteConversion() {
  const analytics = await getAdminInviteAnalytics()
  if (!analytics.success) {
    return { success: false, error: analytics.error }
  }

  const lowGroups = (analytics.data ?? [])
    .filter(group => {
      const conversion = group.conversionRate ?? 0
      const total = group.totalTokens ?? 0
      return conversion < THRESHOLD && total >= MIN_TOKENS
    })
    .sort((a, b) => (a.conversionRate ?? 0) - (b.conversionRate ?? 0))
    .slice(0, TOP_N)

  if (lowGroups.length === 0) {
    return { success: true, message: 'All groups above conversion threshold' }
  }

  if (WEBHOOK) {
    const attachments = lowGroups.map(group => ({
      color: '#E53E3E',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${group.groupName}* conversion dropped to ${group.conversionRate}% (${group.usedTokens}/${group.totalTokens}).`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Avg delay ${group.avgUseDelayMinutes} min • ${group.suppressionCount} suppressed • ${group.scheduledNextWeek} upcoming sends`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View analytics',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/analytics`,
              style: 'primary',
            },
          ],
        },
      ],
    }))

    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Invite conversions below ${THRESHOLD}% (${lowGroups.length} group(s))`,
        attachments,
      }),
    })
  }

  return {
    success: true,
    alerted: lowGroups.length,
    groups: lowGroups.map(group => ({
      groupId: group.groupId,
      groupName: group.groupName,
      conversionRate: group.conversionRate,
    })),
  }
}

