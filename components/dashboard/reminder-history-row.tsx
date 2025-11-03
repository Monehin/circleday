'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { retryFailedReminder } from '@/lib/actions/reminder-history'
import { Button } from '@/components/ui/button'
import { ReminderStatusBadge } from '@/components/dashboard/reminder-status-badge'
import { toast } from 'sonner'
import { ScheduledSend, Event, Contact, SendLog } from '@prisma/client'

type ReminderWithDetails = ScheduledSend & {
  event: Event & {
    contact: Contact
  }
  sendLogs: SendLog[]
}

interface ReminderHistoryRowProps {
  reminder: ReminderWithDetails
  onRetrySuccess: () => void
}

export function ReminderHistoryRow({
  reminder,
  onRetrySuccess,
}: ReminderHistoryRowProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  async function handleRetry() {
    setIsRetrying(true)
    try {
      const result = await retryFailedReminder(reminder.id)
      if (result.success) {
        toast.success('Reminder queued for retry')
        onRetrySuccess()
      } else {
        toast.error(result.error || 'Failed to retry reminder')
      }
    } catch (error) {
      toast.error('Failed to retry reminder')
    } finally {
      setIsRetrying(false)
    }
  }

  const channelIcon = reminder.channel === 'EMAIL' ? '📧' : '📱'
  const eventTitle = reminder.event.title || `${reminder.event.contact.name}'s ${reminder.event.type.toLowerCase()}`
  
  // Get latest send log
  const latestLog = reminder.sendLogs[0]

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Event Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{channelIcon}</span>
            <h4 className="font-medium truncate">{eventTitle}</h4>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Contact:</span>{' '}
              {reminder.event.contact.name}
            </div>
            <div>
              <span className="font-medium">Due Date:</span>{' '}
              {format(new Date(reminder.dueAtUtc), 'MMM dd, yyyy')}
            </div>
            <div>
              <span className="font-medium">Offset:</span> T{reminder.offset >= 0 ? '+' : ''}{reminder.offset}
            </div>
            <div>
              <span className="font-medium">Retry Count:</span> {reminder.retryCount}/3
            </div>
          </div>

          {/* Send Logs */}
          {latestLog && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Provider:</span> {latestLog.provider}
              {latestLog.providerMessageId && (
                <>
                  {' • '}
                  <span className="font-medium">Message ID:</span>{' '}
                  {latestLog.providerMessageId}
                </>
              )}
              {latestLog.error && (
                <>
                  {' • '}
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Error:
                  </span>{' '}
                  {latestLog.error}
                </>
              )}
            </div>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col items-end gap-2">
          <ReminderStatusBadge status={reminder.status} />
          
          {reminder.status === 'FAILED' && reminder.retryCount < 3 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? '⏳ Retrying...' : '🔄 Retry'}
            </Button>
          )}

          {reminder.sentAt && (
            <span className="text-xs text-muted-foreground">
              Sent {format(new Date(reminder.sentAt), 'MMM dd, HH:mm')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

