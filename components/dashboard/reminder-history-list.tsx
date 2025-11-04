'use client'

import { useState, useEffect } from 'react'
import { getReminderHistory } from '@/lib/actions/reminder-history'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReminderStatusBadge } from '@/components/dashboard/reminder-status-badge'
import { ReminderHistoryFilters } from '@/components/dashboard/reminder-history-filters'
import { ReminderHistoryRow } from '@/components/dashboard/reminder-history-row'
import { Loader } from '@/components/ui/loader'
import { exportRemindersToCSV } from '@/lib/utils/csv-export'
import { SendStatus, ChannelType, ScheduledSend, Event, Contact, SendLog } from '@prisma/client'

type ReminderWithDetails = ScheduledSend & {
  event: Event & {
    contact: Contact
  }
  sendLogs: SendLog[]
}

interface ReminderHistoryListProps {
  groupId: string
  groupName?: string
  status?: string
  channel?: string
  page?: number
}

export function ReminderHistoryList({
  groupId,
  groupName = 'Group',
  status = 'ALL',
  channel = 'ALL',
  page = 1,
}: ReminderHistoryListProps) {
  const [reminders, setReminders] = useState<ReminderWithDetails[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(status)
  const [selectedChannel, setSelectedChannel] = useState<string>(channel)
  const [currentPage, setCurrentPage] = useState(page)

  const limit = 20

  useEffect(() => {
    if (groupId) {
      loadReminders()
    }
  }, [groupId, selectedStatus, selectedChannel, currentPage])

  async function loadReminders() {
    setLoading(true)
    setError(null)
    try {
      const result = await getReminderHistory({
        groupId,
        status: selectedStatus as any,
        channel: selectedChannel as any,
        limit,
        offset: (currentPage - 1) * limit,
      })

      if (result.success && result.reminders) {
        setReminders(result.reminders as ReminderWithDetails[])
        setTotal(result.total || 0)
      } else {
        setError(result.error || 'Failed to load reminders')
        setReminders([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Failed to load reminders:', error)
      setError('Failed to load reminders')
      setReminders([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  function handleExport() {
    if (reminders.length === 0) {
      return
    }
    exportRemindersToCSV(reminders, groupName)
  }

  if (loading && reminders.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ReminderHistoryFilters
        status={selectedStatus}
        channel={selectedChannel}
        onStatusChange={setSelectedStatus}
        onChannelChange={setSelectedChannel}
        onRefresh={loadReminders}
        onExport={reminders.length > 0 ? handleExport : undefined}
      />

      {/* Results */}
      <Card className="p-6">
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-destructive mb-2">
                {error}
              </p>
              <button 
                onClick={loadReminders}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-muted-foreground">
                No reminders found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or create a new reminder rule
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * limit + 1}-
                  {Math.min(currentPage * limit, total)} of {total} reminders
                </p>
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader size="sm" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                {loading && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <Loader />
                  </div>
                )}
                {reminders.map((reminder) => (
                  <ReminderHistoryRow
                    key={reminder.id}
                    reminder={reminder}
                    onRetrySuccess={loadReminders}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

