'use client'

import { cn } from '@/lib/utils'
import { SendStatus } from '@prisma/client'

interface ReminderStatusBadgeProps {
  status: SendStatus
  className?: string
}

export function ReminderStatusBadge({ status, className }: ReminderStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'QUEUED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'SENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'BOUNCED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'PENDING':
        return '⏳'
      case 'QUEUED':
        return '📤'
      case 'SENT':
        return '✅'
      case 'DELIVERED':
        return '📬'
      case 'FAILED':
        return '❌'
      case 'BOUNCED':
        return '⚠️'
      default:
        return '❓'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusStyles(),
        className
      )}
    >
      <span>{getStatusIcon()}</span>
      <span>{status}</span>
    </span>
  )
}

