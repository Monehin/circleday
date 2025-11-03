import { resend, FROM_EMAIL } from '@/lib/email/client'
import { ReminderEmail } from '@/lib/email/templates/reminder'
import { db } from '@/lib/db'
import { calculateRemindersForToday, type ReminderToSend } from './reminder-calculator'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send a single reminder email
 */
async function sendReminderEmail(reminder: ReminderToSend): Promise<boolean> {
  try {
    // In development, just log the reminder
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 ===== REMINDER EMAIL =====')
      console.log('To:', reminder.recipientEmail)
      console.log('Name:', reminder.recipientName)
      console.log('Event:', reminder.eventTitle || `${reminder.contactName}'s ${reminder.eventType}`)
      console.log('Days Until:', reminder.daysUntil)
      console.log('Group:', reminder.groupName)
      console.log('===========================\n')
      return true
    }

    // In production, send via Resend
    await resend.emails.send({
      from: FROM_EMAIL,
      to: reminder.recipientEmail,
      subject: `Reminder: ${reminder.eventTitle || `${reminder.contactName}'s ${reminder.eventType}`} ${
        reminder.daysUntil === 0 ? 'is today!' : `in ${reminder.daysUntil} days`
      }`,
      react: ReminderEmail({
        recipientName: reminder.recipientName,
        contactName: reminder.contactName,
        eventType: reminder.eventType,
        eventTitle: reminder.eventTitle,
        eventDate: reminder.nextOccurrence,
        daysUntil: reminder.daysUntil,
        groupName: reminder.groupName,
        appUrl: APP_URL,
      }),
    })

    return true
  } catch (error) {
    console.error('Failed to send reminder email:', error)
    return false
  }
}

/**
 * Log a sent reminder (console logging for now)
 * TODO: Integrate with ScheduledSend/SendLog schema for proper tracking
 */
async function logReminderSent(
  reminder: ReminderToSend,
  success: boolean,
  error?: string
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventId: reminder.eventId,
    recipientEmail: reminder.recipientEmail,
    channel: 'EMAIL',
    status: success ? 'SENT' : 'FAILED',
    error: error || null,
    metadata: {
      ruleId: reminder.ruleId,
      groupId: reminder.groupId,
      groupName: reminder.groupName,
      offset: reminder.offset,
      daysUntil: reminder.daysUntil,
      contactName: reminder.contactName,
    },
  }
  
  console.log('📋 Reminder Log:', JSON.stringify(logEntry, null, 2))
  
  // TODO: Store in database using ScheduledSend/SendLog schema
  // This requires creating ScheduledSend records during reminder calculation
  // and then updating them with SendLog entries during sending
}

/**
 * Process and send all reminders for today
 * This is the main function called by the cron job
 */
export async function processRemindersForToday(): Promise<{
  total: number
  sent: number
  failed: number
  errors: string[]
}> {
  const errors: string[] = []
  let sent = 0
  let failed = 0

  try {
    // Calculate all reminders that should be sent today
    const reminders = await calculateRemindersForToday()
    const total = reminders.length

    console.log(`📅 Processing ${total} reminders for today...`)

    // Send each reminder
    for (const reminder of reminders) {
      try {
        const success = await sendReminderEmail(reminder)
        
        if (success) {
          sent++
          await logReminderSent(reminder, true)
          console.log(`✅ Sent reminder to ${reminder.recipientEmail} for ${reminder.contactName}'s ${reminder.eventType}`)
        } else {
          failed++
          await logReminderSent(reminder, false, 'Failed to send email')
          errors.push(`Failed to send reminder to ${reminder.recipientEmail}`)
        }
      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await logReminderSent(reminder, false, errorMessage)
        errors.push(`Error sending reminder to ${reminder.recipientEmail}: ${errorMessage}`)
        console.error(`❌ Error sending reminder:`, error)
      }
    }

    console.log(`✅ Reminder processing complete: ${sent} sent, ${failed} failed`)

    return { total, sent, failed, errors }
  } catch (error) {
    console.error('Failed to process reminders:', error)
    throw error
  }
}

/**
 * Get reminder sending history for an event
 * TODO: Implement with ScheduledSend/SendLog schema
 */
export async function getReminderHistory(eventId: string) {
  console.log('getReminderHistory called for event:', eventId)
  // TODO: Query ScheduledSend and SendLog tables
  return { success: true, logs: [] }
}

/**
 * Get reminder sending statistics
 * TODO: Implement with ScheduledSend/SendLog schema
 */
export async function getReminderSendingStats() {
  // TODO: Query ScheduledSend and SendLog tables for statistics
  return {
    success: true,
    stats: {
      totalSent: 0,
      totalFailed: 0,
      successRate: '0',
      recentSends: [],
    },
  }
}

