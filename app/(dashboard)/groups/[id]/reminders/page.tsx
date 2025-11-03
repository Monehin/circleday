'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { getReminderRules, deleteReminderRule, type ReminderRuleListItem } from '@/lib/actions/reminder-rules'
import { getGroupById } from '@/lib/actions/groups'
import { toast } from 'sonner'
import { AddReminderRuleModal } from '@/components/dashboard/add-reminder-rule-modal'

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

