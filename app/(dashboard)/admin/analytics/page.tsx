'use server'

import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { Card } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { getAdminInviteAnalytics } from '@/lib/actions/admin-invite-analytics'

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  const analytics = await getAdminInviteAnalytics()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Monitor invite conversion, suppression trends, and reminder cadence across your groups.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            Back to dashboard
          </Link>
        </div>

        {!analytics.success ? (
          <Card className="p-6 border border-border/50">
            <p className="text-sm text-center text-destructive">
              {analytics.error || 'Failed to load admin analytics'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(analytics.data ?? []).map(group => (
              <Card key={group.groupId} className="p-6 border-border/30 shadow-sm space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{group.groupName}</h2>
                  <p className="text-xs text-muted-foreground">Group ID: {group.groupId}</p>
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium text-foreground">{group.totalTokens ?? 0}</span>{' '}
                    invite tokens created
                  </div>
                  <div>
                    Conversion: <span className="font-medium">{group.conversionRate ?? 0}%</span> (
                    {group.usedTokens ?? 0} used / {group.expiredTokens ?? 0} expired)
                  </div>
                  <div>
                    Pending: <span className="font-medium">{group.pendingTokens ?? 0}</span>
                  </div>
                  <div>
                    Avg use delay: <span className="font-medium">{group.avgUseDelayMinutes ?? 0} min</span>
                  </div>
                  <div>
                    Suppressed: <span className="font-medium">{group.suppressionCount ?? 0}</span>
                  </div>
                  <div>
                    Reminders next week: <span className="font-medium">{group.scheduledNextWeek ?? 0}</span>
                  </div>
                </div>
                <Link
                  href={`/groups/${group.groupId}/reminders`}
                  className="text-xs text-primary hover:underline"
                >
                  View group reminders
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

