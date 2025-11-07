/**
 * Reminder Scheduling Workflow
 * 
 * Handles scheduling and sending of reminder notifications via email and SMS.
 * Supports pause/resume/cancel operations via signals.
 */

import { 
  proxyActivities, 
  sleep, 
  defineSignal, 
  defineQuery,
  setHandler,
  condition,
} from '@temporalio/workflow'
import type * as activities from '../activities/reminder.activities'

// Activity configuration
const { 
  sendReminderEmail, 
  sendReminderSMS, 
  logReminderSent,
  validateEventData,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    maximumAttempts: 3,
  },
})

// Signals for workflow control
export const pauseSignal = defineSignal('pause')
export const resumeSignal = defineSignal('resume')
export const cancelSignal = defineSignal('cancel')

// Query for workflow status
export const statusQuery = defineQuery<WorkflowStatus>('status')

// Types
export interface ReminderInput {
  eventId: string
  eventName: string
  eventDate: Date
  recipientEmail: string
  recipientPhone?: string
  recipientName: string
  groupName: string
  daysBeforeEvent: number
  channels: ('EMAIL' | 'SMS')[]
}

export interface WorkflowStatus {
  isPaused: boolean
  isCanceled: boolean
  remindersSent: number
  nextReminderAt: Date | null
  eventDate: Date
  eventName: string
}

/**
 * Main Reminder Workflow
 * 
 * Schedules and sends reminders at specified time before events.
 * Handles pause/resume/cancel operations during execution.
 * 
 * @param input - Reminder configuration
 * @returns Result status of sent reminders
 */
export async function reminderWorkflow(input: ReminderInput): Promise<string> {
  let isPaused = false
  let isCanceled = false
  let remindersSent = 0

  // Register signal handlers
  setHandler(pauseSignal, () => {
    isPaused = true
  })

  setHandler(resumeSignal, () => {
    isPaused = false
  })

  setHandler(cancelSignal, () => {
    isCanceled = true
  })

  // Register query handler
  setHandler(statusQuery, (): WorkflowStatus => ({
    isPaused,
    isCanceled,
    remindersSent,
    nextReminderAt: isCanceled ? null : new Date(input.eventDate),
    eventDate: new Date(input.eventDate),
    eventName: input.eventName,
  }))

  // Validate input
  await validateEventData(input)

  // Calculate sleep duration
  const eventTime = new Date(input.eventDate).getTime()
  const daysInMs = input.daysBeforeEvent * 24 * 60 * 60 * 1000
  const reminderTime = eventTime - daysInMs
  const now = Date.now()
  const sleepDuration = reminderTime - now

  // Sleep until reminder time (with periodic checks for signals)
  if (sleepDuration > 0) {
    const checkInterval = 60 * 1000 // Check every minute
    let remainingSleep = sleepDuration

    while (remainingSleep > 0 && !isCanceled) {
      if (isPaused) {
        await condition(() => !isPaused || isCanceled)
        if (isCanceled) break
      }

      const sleepTime = Math.min(remainingSleep, checkInterval)
      await sleep(sleepTime)
      remainingSleep -= sleepTime
    }
  }

  if (isCanceled) {
    return 'CANCELED'
  }

  // Send notifications via configured channels
  const results: string[] = []

  for (const channel of input.channels) {
    try {
      if (channel === 'EMAIL') {
        await sendReminderEmail({
          to: input.recipientEmail,
          recipientName: input.recipientName,
          eventName: input.eventName,
          eventDate: new Date(input.eventDate),
          daysUntilEvent: input.daysBeforeEvent,
          groupName: input.groupName,
        })
        results.push('EMAIL_SENT')
      } else if (channel === 'SMS' && input.recipientPhone) {
        await sendReminderSMS({
          to: input.recipientPhone,
          recipientName: input.recipientName,
          eventName: input.eventName,
          eventDate: new Date(input.eventDate),
          daysUntilEvent: input.daysBeforeEvent,
        })
        results.push('SMS_SENT')
      }

      remindersSent++
    } catch (error) {
      console.error(`Failed to send ${channel}:`, error)
      results.push(`${channel}_FAILED`)
    }
  }

  // Log execution
  await logReminderSent({
    eventId: input.eventId,
    recipientEmail: input.recipientEmail,
    channels: input.channels,
    status: results.join(','),
  })

  return `Sent via: ${results.join(', ')}`
}
