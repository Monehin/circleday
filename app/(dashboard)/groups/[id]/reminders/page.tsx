
'use client'

// Force dynamic rendering for personalized content

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loader'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getReminderRules, deleteReminderRule, type ReminderRuleListItem } from '@/lib/actions/reminder-rules'
import { getGroupById, toggleGroupReminders } from '@/lib/actions/groups'
import { toast } from 'sonner'
import { AddReminderRuleModal } from '@/components/dashboard/add-reminder-rule-modal'
import { format } from 'date-fns'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function GroupRemindersPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<any>(null)
  const [rules, setRules] = useState<ReminderRuleListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isTogglingReminders, setIsTogglingReminders] = useState(false)
  const [health, setHealth] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [inviteAnalytics, setInviteAnalytics] = useState<any>(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push('/login')
    }
  }, [session, sessionPending, router])

  useEffect(() => {
    if (session && groupId) {
      loadData()
    }
  }, [session, groupId])

  useEffect(() => {
    if (groupId && session) {
      loadHealth()
      loadInviteAnalytics()
    }
  }, [groupId, session])

  const loadInviteAnalytics = async () => {
    setInviteLoading(true)
    try {
    const response = await fetch(`/api/groups/${groupId}/invites/analytics`, {
      cache: 'no-store',
      credentials: 'include',
    })
      if (!response.ok) {
        throw new Error('Failed to load invite analytics')
      }
      const data = await response.json()
      setInviteAnalytics(data)
    } catch (error) {
      console.error('Failed to load invite analytics:', error)
    } finally {
      setInviteLoading(false)
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [groupResult, rulesResult] = await Promise.all([
        getGroupById(groupId),
        getReminderRules(groupId),
      ])

      if (groupResult.success && groupResult.group) {
        setGroup(groupResult.group)
      } else {
        toast.error(groupResult.error || 'Failed to load group')
        router.push('/groups')
        return
      }

      if (rulesResult.success && rulesResult.rules) {
        setRules(rulesResult.rules)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load reminder rules')
    } finally {
      setIsLoading(false)
    }
  }

  const loadHealth = async () => {
    setHealthLoading(true)
    setHealthError(null)
    try {
      const response = await fetch(`/api/groups/${groupId}/health`, {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!response.ok) {
        const text = await response.text()
        console.error('Failed to load reliability metrics', response.status, text)
        setHealthError(`Load failed (${response.status})`)
        return
      }
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error('Failed to load reliability health:', error)
      setHealthError('Failed to load reliability metrics')
    } finally {
      setHealthLoading(false)
    }
  }

  const handleToggleReminders = async () => {
    if (!group) return

    setIsTogglingReminders(true)
    try {
      const result = await toggleGroupReminders(groupId, !group.remindersEnabled)
      if (result.success) {
        setGroup({ ...group, remindersEnabled: result.remindersEnabled })
        toast.success(`Reminders ${result.remindersEnabled ? 'enabled' : 'disabled'}`)
        loadHealth()
      } else {
        toast.error(result.error || 'Failed to toggle reminders')
      }
    } catch (error) {
      toast.error('Failed to toggle reminders')
    } finally {
      setIsTogglingReminders(false)
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this reminder rule?')) {
      return
    }

    setIsDeleting(ruleId)
    try {
      const result = await deleteReminderRule(ruleId)

      if (result.success) {
        toast.success('Reminder rule deleted')
        setRules(prev => prev.filter(r => r.id !== ruleId))
      } else {
        toast.error(result.error || 'Failed to delete reminder rule')
      }
    } catch (error) {
      toast.error('Failed to delete reminder rule')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatOffset = (offset: number) => {
    if (offset === 0) return 'On the day'
    if (offset > 0) return `${offset} day${offset > 1 ? 's' : ''} after`
    return `${Math.abs(offset)} day${Math.abs(offset) > 1 ? 's' : ''} before`
  }

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${period}`
  }

  if (sessionPending || isLoading) {
    return <PageLoader message="Loading reminder rules..." />
  }

  if (!session || !group) {
    return null
  }

  const isOwnerOrAdmin = group.members?.some(
    (m: any) => m.user?.id === session.user.id && ['OWNER', 'ADMIN'].includes(m.role)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/groups">Groups</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/groups/${groupId}`}>{group.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reminders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Reminder Rules</h1>
            <p className="text-muted-foreground text-lg">
              Configure when and how to be reminded about celebrations
            </p>
          </div>
          {isOwnerOrAdmin && (
            <Button onClick={() => setShowAddModal(true)}>
              Add Reminder Rule
            </Button>
          )}
        </motion.div>

        {/* Reminder Toggle */}
        {isOwnerOrAdmin && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6 border-border/50 shadow-lifted">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleReminders}
                  disabled={isTogglingReminders || rules.length === 0}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    group.remindersEnabled ? 'bg-primary' : 'bg-muted'
                  } ${isTogglingReminders || rules.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  role="switch"
                  aria-checked={group.remindersEnabled}
                  title={rules.length === 0 ? 'Add reminder rules first to enable reminders' : ''}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      group.remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Reminders {group.remindersEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rules.length === 0 
                      ? 'Add reminder rules first to enable reminders'
                      : group.remindersEnabled 
                        ? 'Members will receive reminders based on the rules below' 
                        : 'No reminders will be sent until enabled'}
                  </p>
                </div>
                {rules.length === 0 && (
                  <div className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                    No rules set
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {(healthLoading || (health && health.success)) && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6 border-border/50 shadow-lifted space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Temporal Reliability</h3>
                  <p className="text-xs text-muted-foreground">
                    Insights from the latest reconciliation window & send rates
                  </p>
                </div>
                <Link
                  href={`/api/metrics/reminders/reconciliation?groupId=${groupId}`}
                  className="text-xs text-primary hover:underline"
                >
                  View reconciliation metrics
                </Link>
              </div>
              {healthLoading ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Last reconcile</p>
                    <p className="text-base font-semibold text-foreground">
                      {health?.health?.reconciliation?.windowEnd
                        ? format(new Date(health.health.reconciliation.windowEnd), 'Pp')
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {health?.health?.reconciliation?.discrepancyCount ?? 0} issue(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement (7d)</p>
                    <p className="text-base font-semibold text-foreground">
                      {health?.health?.engagement?.counts?.SENT || 0} sent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {health?.health?.engagement?.counts?.FAILED || 0} failed
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Suppressed</p>
                    <p className="text-base font-semibold text-foreground">
                      {health?.health?.suppression?.suppressed || 0} /{' '}
                      {health?.health?.suppression?.totalRecipients || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {health?.health?.suppression?.percentage || 0}% blocked
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latest scheduled send</p>
                    <p className="text-base font-semibold text-foreground">
                      {health?.health?.latestScheduledSend?.dueAtUtc
                        ? `${format(new Date(health.health.latestScheduledSend.dueAtUtc), 'Pp')} (${health.health.latestScheduledSend.status})`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate limit health</p>
                    <p className="text-base font-semibold text-foreground">
                      {health?.health?.rateLimitHealthy ? 'Healthy' : 'Unhealthy'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
        {(inviteAnalytics && inviteAnalytics.success) && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6 border-border/50 shadow-lifted space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Invite Link Analytics</h3>
                  <p className="text-xs text-muted-foreground">
                    Track how many invite tokens convert and how long members take to add events
                  </p>
                </div>
                <Link
                  href={`/groups/${groupId}?tab=invites`}
                  className="text-xs text-primary hover:underline"
                >
                  Manage invite links
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens created</p>
                  <p className="text-base font-semibold text-foreground">
                    {inviteAnalytics.stats.totalTokens}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inviteAnalytics.stats.pendingTokens} pending
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="text-base font-semibold text-foreground">
                    {inviteAnalytics.stats.conversionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inviteAnalytics.stats.usedTokens} used / {inviteAnalytics.stats.expiredTokens}{' '}
                    expired
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg usage delay</p>
                  <p className="text-base font-semibold text-foreground">
                    {inviteAnalytics.stats.avgUseDelayMinutes} min
                  </p>
                  <p className="text-xs text-muted-foreground">
                    since creation
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Rules List */}
        {rules.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-12 text-center border-border/50 shadow-lifted">
              <div className="mb-4 text-6xl">⏰</div>
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Reminder Rules Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Set up reminder rules to get notified before celebrations so you never miss an important date!
              </p>
              {isOwnerOrAdmin && (
                <Button size="lg" onClick={() => setShowAddModal(true)}>
                  Create Your First Reminder Rule
                </Button>
              )}
              {!isOwnerOrAdmin && (
                <p className="text-sm text-muted-foreground">
                  Only group owners and admins can create reminder rules.
                </p>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-4"
          >
            {rules.map((rule) => (
              <motion.div key={rule.id} variants={fadeUp}>
                <Card className="p-6 hover:shadow-lifted transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">⏰</span>
                        <h3 className="text-lg font-semibold text-foreground">
                          Remind at {formatTime(rule.sendHour)}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {rule.offsets.sort((a, b) => b - a).map((offset) => {
                          const channels = rule.channels[offset.toString()] || []
                          return (
                            <div key={offset} className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-foreground min-w-[140px]">
                                {formatOffset(offset)}
                              </span>
                              <div className="flex gap-2">
                                {channels.includes('EMAIL') && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                                    📧 Email
                                  </span>
                                )}
                                {channels.includes('SMS') && (
                                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
                                    💬 SMS
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 text-xs text-muted-foreground">
                        Created {new Date(rule.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {isOwnerOrAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          disabled={isDeleting === rule.id}
                        >
                          {isDeleting === rule.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 bg-muted/30 border-border/50">
            <h3 className="font-semibold text-foreground mb-2">How Reminder Rules Work</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set up multiple reminders for different time offsets (e.g., 7 days before, 1 day before, on the day)</li>
              <li>• Choose notification channels for each offset (Email, SMS)</li>
              <li>• Reminders are sent at your preferred time each day</li>
              <li>• All members of the group receive the reminders</li>
            </ul>
          </Card>
        </motion.div>
      </main>

      {/* Add Reminder Rule Modal */}
      {showAddModal && (
        <AddReminderRuleModal
          groupId={groupId}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
