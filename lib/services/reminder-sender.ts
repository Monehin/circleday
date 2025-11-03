import { resend, FROM_EMAIL } from '@/lib/email/client'
import { ReminderEmail } from '@/lib/email/templates/reminder'
import { db } from '@/lib/db'
import { ChannelType, SendStatus, ScheduledSend, Event, Contact } from '@prisma/client'
import {
  getPendingScheduledSendsForToday,
  getFailedSendsToRetry,
} from './reminder-scheduler'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

type ScheduledSendWithEvent = ScheduledSend & {
  event: Event & {
    contact: Contact
  }
}

/**
 * Get recipient details for a scheduled send
 */
async function getRecipientDetails(scheduledSend: ScheduledSendWithEvent) {
  // Find the group membership for this event's contact
  const membership = await db.membership.findFirst({
    where: {
      contactId: scheduledSend.event.contactId,
      status: 'ACTIVE',
    },
    include: {
      user: true,
      group: true,
    },
  })

  if (!membership || !membership.user) {
    return null
  }

  // Determine recipient identifier based on channel
  let recipientIdentifier: string | null = null
  if (scheduledSend.channel === 'EMAIL') {
    recipientIdentifier = membership.user.email
  } else if (scheduledSend.channel === 'SMS') {
    recipientIdentifier = membership.user.phone
  }

  if (!recipientIdentifier) {
    return null
  }

  return {
    recipientIdentifier,
    recipientName: membership.user.name || membership.user.email,
    groupName: membership.group.name,
  }
}

/**
 * Send a reminder email using Resend
 */
async function sendReminderEmail(
  scheduledSend: ScheduledSendWithEvent,
  recipientEmail: string,
  recipientName: string,
  groupName: string
): Promise<{ success: boolean; providerMessageId?: string; error?: string }> {
  try {
    // In development, just log instead of sending (unless RESEND_API_KEY is set)
    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
      console.log('\n📧 ===== REMINDER EMAIL =====')
      console.log('To:', recipientEmail)
      console.log('Name:', recipientName)
      console.log('Event:', scheduledSend.event.title || `${scheduledSend.event.contact.name}'s ${scheduledSend.event.type}`)
      console.log('Days Until:', Math.abs(scheduledSend.offset))
      console.log('Group:', groupName)
      console.log('===========================\n')
      return { success: true, providerMessageId: 'dev-' + Date.now() }
    }

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Reminder: ${scheduledSend.event.title || `${scheduledSend.event.contact.name}'s ${scheduledSend.event.type}`} ${
        scheduledSend.offset === 0 ? 'is today!' : `in ${Math.abs(scheduledSend.offset)} days`
      }`,
      react: ReminderEmail({
        recipientName,
        contactName: scheduledSend.event.contact.name,
        eventType: scheduledSend.event.type,
        eventTitle: scheduledSend.event.title,
        eventDate: scheduledSend.targetDate,
        daysUntil: Math.abs(scheduledSend.offset),
        groupName,
        appUrl: APP_URL,
      }),
    })

    return {
      success: true,
      providerMessageId: response.data?.id || undefined,
    }
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a reminder SMS using Twilio
 */
async function sendReminderSMS(
  scheduledSend: ScheduledSendWithEvent,
  recipientPhone: string,
  recipientName: string,
  groupName: string
): Promise<{ success: boolean; providerMessageId?: string; error?: string }> {
  try {
    const {
      twilioClient,
      TWILIO_PHONE_NUMBER,
      isSMSEnabled,
      formatPhoneNumber,
    } = await import('@/lib/sms/client')
    const { generateReminderSMS } = await import('@/lib/sms/templates/reminder')

    // Check if SMS is enabled
    if (!isSMSEnabled()) {
      console.log('📱 SMS not enabled (Twilio credentials not configured)')
      return {
        success: false,
        error: 'SMS not enabled - Twilio credentials not configured',
      }
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(recipientPhone)

    // Generate SMS message
    const smsBody = generateReminderSMS({
      contactName: scheduledSend.event.contact.name,
      eventType: scheduledSend.event.type,
      eventTitle: scheduledSend.event.title,
      eventDate: scheduledSend.targetDate,
      daysUntil: Math.abs(scheduledSend.offset),
      groupName,
      appUrl: APP_URL,
    })

    // In development without Twilio, just log
    if (process.env.NODE_ENV === 'development' && !twilioClient) {
      console.log('\n📱 ===== REMINDER SMS =====')
      console.log('To:', formattedPhone)
      console.log('From:', TWILIO_PHONE_NUMBER)
      console.log('Message:', smsBody)
      console.log('==========================\n')
      return { success: true, providerMessageId: 'dev-sms-' + Date.now() }
    }

    // Send via Twilio
    const message = await twilioClient!.messages.create({
      body: smsBody,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    console.log(`✅ Sent SMS reminder to ${formattedPhone}:`, message.sid)

    return {
      success: true,
      providerMessageId: message.sid,
    }
  } catch (error) {
    console.error('❌ Failed to send SMS reminder:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Process a single scheduled send
 */
async function processScheduledSend(
  scheduledSend: ScheduledSendWithEvent
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update status to QUEUED
    await db.scheduledSend.update({
      where: { id: scheduledSend.id },
      data: { status: 'QUEUED' },
    })

    // Get recipient details
    const recipientDetails = await getRecipientDetails(scheduledSend)
    if (!recipientDetails) {
      throw new Error('No recipient found or recipient has no contact info')
    }

    const { recipientIdentifier, recipientName, groupName } = recipientDetails

    // Send based on channel
    let result: { success: boolean; providerMessageId?: string; error?: string }
    
    if (scheduledSend.channel === 'EMAIL') {
      result = await sendReminderEmail(
        scheduledSend,
        recipientIdentifier,
        recipientName,
        groupName
      )
    } else if (scheduledSend.channel === 'SMS') {
      result = await sendReminderSMS(
        scheduledSend,
        recipientIdentifier,
        recipientName,
        groupName
      )
    } else {
      result = { success: false, error: 'Unknown channel type' }
    }

    // Create send log
    await db.sendLog.create({
      data: {
        scheduledSendId: scheduledSend.id,
        provider: scheduledSend.channel === 'EMAIL' ? 'resend' : 'twilio',
        providerMessageId: result.providerMessageId,
        status: result.success ? 'SENT' : 'FAILED',
        error: result.error,
      },
    })

    // Update scheduled send status
    if (result.success) {
      await db.scheduledSend.update({
        where: { id: scheduledSend.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      })
      console.log(`✅ Sent ${scheduledSend.channel} reminder for event ${scheduledSend.eventId}`)
    } else {
      await db.scheduledSend.update({
        where: { id: scheduledSend.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          retryCount: { increment: 1 },
        },
      })
      console.log(`❌ Failed to send ${scheduledSend.channel} reminder: ${result.error}`)
    }

    return { success: result.success, error: result.error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log the error
    await db.sendLog.create({
      data: {
        scheduledSendId: scheduledSend.id,
        provider: scheduledSend.channel === 'EMAIL' ? 'resend' : 'twilio',
        status: 'FAILED',
        error: errorMessage,
      },
    })

    // Update scheduled send
    await db.scheduledSend.update({
      where: { id: scheduledSend.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        retryCount: { increment: 1 },
      },
    })

    return { success: false, error: errorMessage }
  }
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
    // Get all pending scheduled sends for today
    const scheduledSends = await getPendingScheduledSendsForToday()
    const total = scheduledSends.length

    console.log(`📅 Processing ${total} scheduled reminders for today...`)

    // Process each scheduled send
    for (const scheduledSend of scheduledSends) {
      const result = await processScheduledSend(scheduledSend)
      
      if (result.success) {
        sent++
      } else {
        failed++
        errors.push(`Failed to send reminder ${scheduledSend.id}: ${result.error}`)
      }
    }

    // Process retries for failed sends (up to 3 attempts)
    const failedSends = await getFailedSendsToRetry(3)
    console.log(`🔄 Retrying ${failedSends.length} failed reminders...`)

    for (const scheduledSend of failedSends) {
      const result = await processScheduledSend(scheduledSend)
      
      if (result.success) {
        sent++
        console.log(`✅ Retry successful for ${scheduledSend.id}`)
      } else {
        failed++
        errors.push(`Retry failed for ${scheduledSend.id}: ${result.error}`)
      }
    }

    console.log(`✅ Reminder processing complete: ${sent} sent, ${failed} failed out of ${total} total`)

    return { total, sent, failed, errors }
  } catch (error) {
    console.error('Failed to process reminders:', error)
    throw error
  }
}

/**
 * Get reminder sending history for an event
 */
export async function getReminderHistory(eventId: string) {
  try {
    const scheduledSends = await db.scheduledSend.findMany({
      where: { eventId },
      include: {
        sendLogs: true,
        event: {
          include: {
            contact: true,
          },
        },
      },
      orderBy: {
        dueAtUtc: 'desc',
      },
    })

    return {
      success: true,
      logs: scheduledSends,
    }
  } catch (error) {
    console.error('Failed to get reminder history:', error)
    return {
      success: false,
      logs: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get reminder sending statistics
 */
export async function getReminderSendingStats() {
  try {
    const [totalSent, totalFailed, recentSends] = await Promise.all([
      db.scheduledSend.count({
        where: { status: { in: ['SENT', 'DELIVERED'] } },
      }),
      db.scheduledSend.count({
        where: { status: 'FAILED' },
      }),
      db.scheduledSend.findMany({
        where: {
          sentAt: { not: null },
        },
        take: 10,
        orderBy: {
          sentAt: 'desc',
        },
        include: {
          event: {
            include: {
              contact: true,
            },
          },
          sendLogs: true,
        },
      }),
    ])

    const successRate = totalSent + totalFailed > 0
      ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
      : '0'

    return {
      success: true,
      stats: {
        totalSent,
        totalFailed,
        successRate,
        recentSends,
      },
    }
  } catch (error) {
    console.error('Failed to get reminder stats:', error)
    return {
      success: false,
      stats: {
        totalSent: 0,
        totalFailed: 0,
        successRate: '0',
        recentSends: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
