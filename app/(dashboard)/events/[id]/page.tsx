'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader, Loader } from '@/components/ui/loader'
import { getEventById, updateEvent, deleteEvent } from '@/lib/actions/events'
import { format } from 'date-fns'
import { toast } from 'sonner'

const updateEventSchema = z.object({
  title: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  yearKnown: z.boolean(),
  repeat: z.boolean(),
  notes: z.string().optional(),
})

type UpdateEventInput = z.infer<typeof updateEventSchema>

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

type EventData = {
  id: string
  contactId: string
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM'
  title: string | null
  date: Date
  yearKnown: boolean
  repeat: boolean
  notes: string | null
  contact: {
    id: string
    name: string
    email: string | null
    phone: string | null
    timezone: string | null
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case 'BIRTHDAY':
      return '🎂'
    case 'ANNIVERSARY':
      return '💍'
    case 'CUSTOM':
      return '🎉'
    default:
      return '📅'
  }
}

function getEventTypeLabel(type: string) {
  switch (type) {
    case 'BIRTHDAY':
      return 'Birthday'
    case 'ANNIVERSARY':
      return 'Anniversary'
    case 'CUSTOM':
      return 'Custom Event'
    default:
      return type
  }
}

export default function EventDetailPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: '',
      date: '',
      yearKnown: true,
      repeat: true,
      notes: '',
    },
  })

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push('/login')
    }
  }, [session, sessionPending, router])

  useEffect(() => {
    if (session && eventId) {
      loadEvent()
    }
  }, [session, eventId])

  const loadEvent = async () => {
    setIsLoading(true)
    setFetchError(null)
    const result = await getEventById(eventId)
    if (result.success && result.event) {
      const eventData = result.event as EventData
      setEvent(eventData)
      reset({
        title: eventData.title || '',
        date: format(new Date(eventData.date), 'yyyy-MM-dd'),
        yearKnown: eventData.yearKnown,
        repeat: eventData.repeat,
        notes: eventData.notes || '',
      })
    } else {
      setFetchError(result.error || 'Failed to load event.')
    }
    setIsLoading(false)
  }

  const onUpdate = async (data: UpdateEventInput) => {
    setIsUpdating(true)
    try {
      const result = await updateEvent({ eventId, ...data })

      if (result.error) {
        setError('root', {
          type: 'manual',
          message: result.error,
        })
        setIsUpdating(false)
        return
      }

      toast.success('Event updated successfully!')
      await loadEvent()
      setIsEditing(false)
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to update event. Please try again.',
      })
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteEvent(eventId)

      if (result.error) {
        toast.error(result.error)
        setIsDeleting(false)
        return
      }

      toast.success('Event deleted successfully')
      router.push('/events')
    } catch (error) {
      toast.error('Failed to delete event. Please try again.')
      setIsDeleting(false)
    }
  }

  if (sessionPending || isLoading) {
    return <PageLoader message="Loading event..." />
  }

  if (!session) {
    return null
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <DashboardHeader user={session.user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center py-16"
          >
            <h1 className="text-4xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground text-lg">{fetchError}</p>
            <Button className="mt-8" onClick={() => router.push('/events')}>
              Back to Events
            </Button>
          </motion.div>
        </main>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <DashboardHeader user={session.user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center py-16"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground text-lg">
              The event you are looking for does not exist or you do not have access.
            </p>
            <Button className="mt-8" onClick={() => router.push('/events')}>
              Back to Events
            </Button>
          </motion.div>
        </main>
      </div>
    )
  }

  const eventTitle = event.type === 'CUSTOM' && event.title 
    ? event.title 
    : event.type === 'BIRTHDAY'
      ? `${event.contact.name}'s Birthday`
      : event.type === 'ANNIVERSARY'
        ? `${event.contact.name}'s Anniversary`
        : 'Event'

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-6 text-sm text-muted-foreground">
          <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{eventTitle}</span>
        </motion.div>

        {/* Event Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2">{eventTitle}</CardTitle>
                    <CardDescription className="text-base">
                      {getEventTypeLabel(event.type)} • {format(new Date(event.date), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <>
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        Edit
                      </Button>
                      <Button 
                        onClick={handleDelete} 
                        variant="destructive"
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader size="sm" /> : 'Delete'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Event Details or Edit Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Event' : 'Event Details'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
                  {/* Title (only for CUSTOM events) */}
                  {event.type === 'CUSTOM' && (
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Event Title
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        {...register('title')}
                        disabled={isUpdating}
                        className="h-11"
                      />
                      <AnimatePresence>
                        {errors.title && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-destructive"
                          >
                            {errors.title.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('date')}
                      disabled={isUpdating}
                      className="h-11"
                    />
                    <AnimatePresence>
                      {errors.date && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-destructive"
                        >
                          {errors.date.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Year Known */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="yearKnown"
                      {...register('yearKnown')}
                      disabled={isUpdating}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="yearKnown" className="text-sm font-medium cursor-pointer">
                      I know the year (show age/years)
                    </Label>
                  </div>

                  {/* Repeat */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="repeat"
                      {...register('repeat')}
                      disabled={isUpdating}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="repeat" className="text-sm font-medium cursor-pointer">
                      Repeat annually
                    </Label>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      disabled={isUpdating}
                      className="min-h-[100px]"
                    />
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
                      {isUpdating ? <Loader size="sm" /> : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact</h3>
                    <p className="text-lg font-medium text-foreground">{event.contact.name}</p>
                    {event.contact.email && (
                      <p className="text-sm text-muted-foreground">{event.contact.email}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                    <p className="text-lg font-medium text-foreground">
                      {format(new Date(event.date), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Year Known</h3>
                      <p className="text-lg font-medium text-foreground">
                        {event.yearKnown ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Repeats</h3>
                      <p className="text-lg font-medium text-foreground">
                        {event.repeat ? 'Annually' : 'One-time'}
                      </p>
                    </div>
                  </div>

                  {event.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                      <p className="text-base text-foreground whitespace-pre-wrap">{event.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

