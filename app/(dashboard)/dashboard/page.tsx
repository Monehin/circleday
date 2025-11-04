
'use client'

// Force dynamic rendering for personalized content

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loader'
import { getGroups } from '@/lib/actions/groups'
import { getUpcomingEvents } from '@/lib/actions/events'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    groupsCount: 0,
    upcomingEventsCount: 0,
    eventsThisWeek: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      loadStats()
    }
  }, [session])

  const loadStats = async () => {
    setIsLoadingStats(true)
    try {
      const [groupsResult, eventsResult] = await Promise.all([
        getGroups(),
        getUpcomingEvents(50),
      ])

      const groupsCount = groupsResult.success && groupsResult.groups ? groupsResult.groups.length : 0
      const events = eventsResult.success && eventsResult.events ? eventsResult.events : []
      const upcomingEventsCount = events.length
      const eventsThisWeek = events.filter(e => e.daysUntil <= 7).length

      setStats({
        groupsCount,
        upcomingEventsCount,
        eventsThisWeek,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  if (isPending || isLoadingStats) {
    return <PageLoader message="Loading dashboard..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your celebrations
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          <motion.div variants={fadeUp}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Groups
                  </p>
                  <p className="text-3xl font-bold text-primary">{stats.groupsCount}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create and manage celebration groups
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Upcoming Events
                  </p>
                  <p className="text-3xl font-bold text-accent">{stats.upcomingEventsCount}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Never miss a special occasion
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    This Week
                  </p>
                  <p className="text-3xl font-bold text-success">{stats.eventsThisWeek}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Celebrations coming up soon
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Getting started */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <span>🎉</span>
                  Get Started
                </h2>
                <p className="text-muted-foreground">
                  Create your first group to start managing celebrations and never miss an important date!
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/groups/new">
                  Create Group
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent activity placeholder */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Recent Activity
          </h2>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No activity yet. Start by creating your first group!
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
