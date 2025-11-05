
'use client'

// Force dynamic rendering for personalized content

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { AddMemberModal } from '@/components/dashboard/add-member-modal'
import { AddEventsModal } from '@/components/dashboard/add-events-modal'
import { ShareEventLinkModal } from '@/components/dashboard/share-event-link-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader, Loader } from '@/components/ui/loader'
import { getGroupById, updateGroup, toggleGroupReminders } from '@/lib/actions/groups'
import Link from 'next/link'
import { CalendarPlus, Link2 } from 'lucide-react'
import { toast } from 'sonner'

const updateGroupSchema = z.object({
  name: z.string().min(2).max(50).trim(),
})

type UpdateGroupInput = z.infer<typeof updateGroupSchema>

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

type GroupMember = {
  id: string
  role: string
  status: string
  contact: {
    id: string
    name: string
    email: string | null
    phone: string | null
    timezone: string | null
  }
  user: {
    id: string
    name: string | null
    email: string
  } | null
  createdAt: Date
  eventCount: number
}

type GroupData = {
  id: string
  name: string
  ownerId: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  defaultTimezone: string
  maxEventsPerMember: number | null
  remindersEnabled: boolean
  createdAt: Date
  updatedAt: Date
  memberCount: number
  members: GroupMember[]
}

export default function GroupDetailPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<GroupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [addEventsContact, setAddEventsContact] = useState<{ id: string; name: string; email?: string | null } | null>(null)
  const [shareEventLinkContact, setShareEventLinkContact] = useState<{ id: string; name: string; email?: string | null; phone?: string | null } | null>(null)
  const [isTogglingReminders, setIsTogglingReminders] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<UpdateGroupInput>({
    resolver: zodResolver(updateGroupSchema),
  })

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push('/login')
    }
  }, [session, sessionPending, router])

  useEffect(() => {
    if (session && groupId) {
      loadGroup()
    }
  }, [session, groupId])

  const loadGroup = async () => {
    setIsLoading(true)
    const result = await getGroupById(groupId)
    if (result.success && result.group) {
      setGroup(result.group)
      reset({ name: result.group.name })
    } else {
      // Group not found or error
      router.push('/groups')
    }
    setIsLoading(false)
  }

  const handleToggleReminders = async () => {
    if (!group) return

    setIsTogglingReminders(true)
    try {
      const result = await toggleGroupReminders(groupId, !group.remindersEnabled)
      if (result.success) {
        setGroup({ ...group, remindersEnabled: result.remindersEnabled })
        toast.success(`Reminders ${result.remindersEnabled ? 'enabled' : 'disabled'}`)
      } else {
        toast.error(result.error || 'Failed to toggle reminders')
      }
    } catch (error) {
      toast.error('Failed to toggle reminders')
    } finally {
      setIsTogglingReminders(false)
    }
  }

  const onSubmit = async (data: UpdateGroupInput) => {
    if (!group) return

    setIsUpdating(true)
    try {
      const result = await updateGroup({
        groupId: group.id,
        name: data.name,
      })

      if (result.error) {
        setError('root', {
          type: 'manual',
          message: result.error,
        })
        setIsUpdating(false)
        return
      }

      // Update local state
      setGroup(prev => prev ? { ...prev, name: data.name } : null)
      setIsEditing(false)
      setIsUpdating(false)
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to update group. Please try again.',
      })
      setIsUpdating(false)
    }
  }

  if (sessionPending || isLoading) {
    return <PageLoader message="Loading group..." />
  }

  if (!session || !group) {
    return null
  }

  const isOwner = group.ownerId === session.user.id
  const isAdmin = group.members.some(
    m => m.user?.id === session.user.id && (m.role === 'OWNER' || m.role === 'ADMIN')
  )
  const canEdit = isOwner || isAdmin

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/groups" className="hover:text-foreground transition-colors">
              Groups
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{group.name}</span>
          </div>
        </motion.div>

        {/* Group Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Group Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          {...register('name')}
                          disabled={isUpdating}
                          className="h-11 max-w-md"
                          aria-invalid={errors.name ? 'true' : 'false'}
                        />
                        <AnimatePresence>
                          {errors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm text-destructive"
                            >
                              {errors.name.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {errors.root && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 overflow-hidden"
                          >
                            <p className="text-sm text-destructive">{errors.root.message}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? (
                            <span className="flex items-center gap-2">
                              <Loader size="sm" variant="primary" />
                              Saving...
                            </span>
                          ) : (
                            'Save'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            reset({ name: group.name })
                          }}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <CardTitle className="text-3xl mb-2">{group.name}</CardTitle>
                      <CardDescription>
                        Created by {group.owner.name} on {new Date(group.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </>
                  )}
                </div>
                {!isEditing && canEdit && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Group
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          <motion.div variants={fadeIn}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Members
                  </p>
                  <p className="text-3xl font-bold text-primary">{group.memberCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Upcoming Events
                  </p>
                  <p className="text-3xl font-bold text-accent">0</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Timezone
                  </p>
                  <p className="text-xl font-bold text-foreground">{group.defaultTimezone}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 border-border/50 shadow-lifted">
            <div className="flex flex-col gap-6">
              {/* Title Section */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage group settings and preferences
                </p>
              </div>

              {/* Toggle and Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Reminders Toggle */}
                {canEdit && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleReminders}
                      disabled={isTogglingReminders}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        group.remindersEnabled ? 'bg-primary' : 'bg-muted'
                      } ${isTogglingReminders ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      role="switch"
                      aria-checked={group.remindersEnabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          group.remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Reminders {group.remindersEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.remindersEnabled ? 'Members will receive reminders' : 'No reminders will be sent'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <Link href={`/groups/${groupId}/reminders`}>
                      ⏰ Manage Reminders
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/groups/${groupId}/history`}>
                      📊 View History
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Members List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Members</CardTitle>
                  <CardDescription>
                    Manage your group members and their roles
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.members.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {(member.contact.name?.[0] || member.contact.email?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.contact.email || member.contact.phone || 'No contact info'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Event Count Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        group.maxEventsPerMember && member.eventCount >= group.maxEventsPerMember
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {group.maxEventsPerMember 
                          ? `${member.eventCount}/${group.maxEventsPerMember} events`
                          : `${member.eventCount} event${member.eventCount !== 1 ? 's' : ''}`
                        }
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.role === 'OWNER' 
                          ? 'bg-primary/10 text-primary' 
                          : member.role === 'ADMIN'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {member.role}
                      </span>
                      {member.user && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          Registered
                        </span>
                      )}
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddEventsContact({
                              id: member.contact.id,
                              name: member.contact.name,
                              email: member.contact.email,
                            })}
                            className="h-8 px-3"
                            title="Add events for this member"
                          >
                            <CalendarPlus className="h-4 w-4 mr-1" />
                            Add Events
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShareEventLinkContact({
                              id: member.contact.id,
                              name: member.contact.name,
                              email: member.contact.email,
                              phone: member.contact.phone,
                            })}
                            className="h-8 px-3"
                            title="Share event link with this member"
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            Share Link
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Modals */}
      <AddMemberModal
        groupId={groupId}
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={() => {
          // Reload group data to show new member
          loadGroup()
        }}
      />

      {addEventsContact && (
        <AddEventsModal
          isOpen={true}
          onClose={() => setAddEventsContact(null)}
          contact={addEventsContact}
          groupId={groupId}
          onSuccess={() => {
            // Reload group data to show updated events
            loadGroup()
          }}
        />
      )}

      {shareEventLinkContact && (
        <ShareEventLinkModal
          isOpen={true}
          onClose={() => setShareEventLinkContact(null)}
          contact={shareEventLinkContact}
          groupId={groupId}
        />
      )}
    </div>
  )
}
