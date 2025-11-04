
'use client'

// Force dynamic rendering for personalized content

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loader'
import { getUpcomingEvents, type EventListItem } from '@/lib/actions/events'
import { format } from 'date-fns'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } }
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

function getEventTitle(event: EventListItem) {
  if (event.type === 'CUSTOM' && event.title) {
    return event.title
  }
  if (event.type === 'BIRTHDAY') {
    return `${event.contactName}'s Birthday`
  }
  if (event.type === 'ANNIVERSARY') {
    return `${event.contactName}'s Anniversary`
  }
  return event.title || 'Event'
}

function getEventSubtitle(event: EventListItem) {
  if (event.type === 'BIRTHDAY' && event.age !== undefined) {
    return `Turning ${event.age} years old`
  }
  if (event.type === 'ANNIVERSARY' && event.years !== undefined) {
    return `${event.years} ${event.years === 1 ? 'year' : 'years'} together`
  }
  return getEventTypeLabel(event.type)
}

function getDaysUntilLabel(daysUntil: number) {
  if (daysUntil === 0) {
    return 'Today! 🎊'
  }
  if (daysUntil === 1) {
    return 'Tomorrow'
  }
  if (daysUntil <= 7) {
    return `In ${daysUntil} days`
  }
  if (daysUntil <= 30) {
    return `In ${daysUntil} days`
  }
  return `In ${Math.ceil(daysUntil / 30)} ${Math.ceil(daysUntil / 30) === 1 ? 'month' : 'months'}`
}

export default function EventsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<EventListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      loadEvents()
    }
  }, [session])

  const loadEvents = async () => {
    setIsLoading(true)
    const result = await getUpcomingEvents(50)
    if (result.success && result.events) {
      setEvents(result.events)
    }
    setIsLoading(false)
  }

  if (isPending || isLoading) {
    return <PageLoader message="Loading events..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Upcoming Celebrations</h1>
            <p className="text-muted-foreground">
              Never miss an important moment
            </p>
          </div>
          <Button asChild>
            <Link href="/events/new">
              Add Event
            </Link>
          </Button>
        </motion.div>

        {events.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 text-center border-border/50 shadow-lifted">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Events Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start adding birthdays, anniversaries, and other special occasions to never miss a celebration!
              </p>
              <Button size="lg" asChild>
                <Link href="/events/new">
                  Add Your First Event
                </Link>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-4"
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={fadeUp}>
                <Link href={`/events/${event.id}`}>
                  <Card className="hover:shadow-lifted transition-all hover:border-primary/20 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {getEventTitle(event)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getEventSubtitle(event)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(event.nextOccurrence, 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            event.daysUntil === 0 
                              ? 'text-primary' 
                              : event.daysUntil <= 7 
                                ? 'text-accent' 
                                : 'text-muted-foreground'
                          }`}>
                            {getDaysUntilLabel(event.daysUntil)}
                          </div>
                          {event.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📝 Has notes
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick stats */}
        {events.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="mt-8 grid gap-6 md:grid-cols-3"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    This Week
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {events.filter(e => e.daysUntil <= 7).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {events.filter(e => e.daysUntil <= 30).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🗓️</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Events
                  </p>
                  <p className="text-3xl font-bold text-success">
                    {events.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-2xl">🎊</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
