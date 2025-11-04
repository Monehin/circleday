
'use client'

// Force dynamic rendering for personalized content

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ReminderHistoryList } from '@/components/dashboard/reminder-history-list'
import { ReminderStatsCardsClient } from '@/components/dashboard/reminder-stats-cards-client'
import { PageLoader } from '@/components/ui/loader'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

interface GroupData {
  id: string
  name: string
}

export default function ReminderHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [group, setGroup] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)

  const groupId = params.id as string

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirectTo=/groups/${groupId}/history`)
    }
  }, [session, isPending, router, groupId])

  useEffect(() => {
    if (session && groupId) {
      loadGroup()
    }
  }, [session, groupId])

  async function loadGroup() {
    try {
      // Fetch group data using server action
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data)
      } else {
        router.push('/groups')
      }
    } catch (error) {
      console.error('Failed to load group:', error)
      router.push('/groups')
    } finally {
      setLoading(false)
    }
  }

  if (isPending || loading) {
    return <PageLoader message="Loading reminder history..." />
  }

  if (!session || !group) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn} 
          className="mb-6 text-sm text-muted-foreground"
        >
          <Link href="/groups" className="hover:text-foreground transition-colors">
            Groups
          </Link>
          <span className="mx-2">/</span>
          <Link 
            href={`/groups/${groupId}`} 
            className="hover:text-foreground transition-colors"
          >
            {group.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">Reminder History</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Reminder History
          </h1>
          <p className="text-muted-foreground text-lg">
            View all reminders sent for {group.name}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-6"
        >
          {/* Statistics Cards */}
          <ReminderStatsCardsClient groupId={groupId} />

          {/* Reminder History List */}
          <ReminderHistoryList
            groupId={groupId}
            groupName={group.name}
          />
        </motion.div>
      </main>
    </div>
  )
}
