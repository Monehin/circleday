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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (groupId) {
      loadStats()
    }
  }, [groupId])

  async function loadStats() {
    setLoading(true)
    setError(null)
    try {
      const result = await getReminderStats(groupId)
      if (result.success && result.stats) {
        setStats(result.stats)
      } else {
        setError(result.error || 'Failed to load statistics')
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-12" />
                <div className="h-2 bg-muted rounded w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-destructive mb-2">{error || 'Failed to load statistics'}</p>
          <button 
            onClick={loadStats}
            className="text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
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

