'use client'

import { useState, useEffect } from 'react'
import { getReminderStats } from '@/lib/actions/reminder-history'
import { Card } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'

interface ReminderStatsCardsClientProps {
  groupId: string
}

export function ReminderStatsCardsClient({ groupId }: ReminderStatsCardsClientProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [groupId])

  async function loadStats() {
    setLoading(true)
    try {
      const result = await getReminderStats(groupId)
      if (result.success && result.stats) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6">
            <Loader size="sm" />
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Failed to load statistics</p>
      </Card>
    )
  }

  const statCards = [
    {
      label: 'Total Scheduled',
      value: stats.totalScheduled,
      icon: '📅',
      description: 'All reminders created',
    },
    {
      label: 'Pending',
      value: stats.totalPending,
      icon: '⏳',
      description: 'Waiting to send',
    },
    {
      label: 'Successfully Sent',
      value: stats.totalSent,
      icon: '✅',
      description: 'Delivered to recipients',
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: '📊',
      description: 'Delivery success rate',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{stat.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

