/**
 * Reminder Activities
 * 
 * Activities handle external I/O operations for sending reminders via email and SMS.
 */

import { Resend } from 'resend'
import twilio from 'twilio'
import { db } from '@/lib/db'
import { format } from 'date-fns'

// Lazy initialization of service clients
let resendInstance: Resend | null = null
let twilioInstance: ReturnType<typeof twilio> | null = null

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

function getTwilio() {
  if (!twilioInstance) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured')
    }
    twilioInstance = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  }
  return twilioInstance
}

/**
 * Validate reminder event data before scheduling
 */
export async function validateEventData(input: any): Promise<void> {
  if (!input.eventId) throw new Error('Missing eventId')
  if (!input.recipientEmail) throw new Error('Missing recipient email')
  if (!input.eventDate) throw new Error('Missing event date')
  if (input.channels.includes('SMS') && !input.recipientPhone) {
    throw new Error('SMS channel selected but no phone number provided')
  }
}

/**
 * Send reminder email via Resend
 * 
 * In development mode, redirects to TEST_EMAIL if configured.
 */
export async function sendReminderEmail(params: {
  to: string
  recipientName: string
  eventName: string
  eventDate: Date
  daysUntilEvent: number
  groupName: string
}): Promise<string> {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const actualRecipient = isDevelopment && process.env.TEST_EMAIL 
    ? process.env.TEST_EMAIL 
    : params.to
  
  if (isDevelopment && process.env.TEST_EMAIL) {
    console.log(`[Dev Mode] Redirecting email from ${params.to} to ${actualRecipient}`)
  }

  const formattedDate = format(new Date(params.eventDate), 'MMMM d, yyyy')
  const daysText = params.daysUntilEvent === 1 ? 'tomorrow' : `in ${params.daysUntilEvent} days`

  const resend = getResend()
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'CircleDay <onboarding@resend.dev>',
    to: actualRecipient,
    subject: `🎉 Reminder: ${params.eventName} is ${daysText}!`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">🎉 Upcoming Celebration!</h2>
        
        <p>Hi ${params.recipientName},</p>
        
        ${isDevelopment && process.env.TEST_EMAIL ? `<p style="background: #fef3c7; padding: 8px; border-radius: 4px; font-size: 12px;">🧪 <strong>Dev Mode:</strong> Original recipient was ${params.to}</p>` : ''}
        
        <p>This is a friendly reminder from <strong>${params.groupName}</strong>:</p>
        
        <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 16px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px 0; color: #7c3aed;">${params.eventName}</h3>
          <p style="margin: 0; font-size: 18px;"><strong>${formattedDate}</strong></p>
          <p style="margin: 8px 0 0 0; color: #64748b;">${daysText}</p>
        </div>
        
        <p>Don't miss this special day! 🎈</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 14px; color: #64748b;">
          Sent by CircleDay - Never miss a celebration<br />
          <a href="https://circleday.app" style="color: #7c3aed;">circleday.app</a>
        </p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data?.id || 'EMAIL_SENT'
}

/**
 * Send reminder SMS via Twilio
 * 
 * In development mode, redirects to TEST_PHONE if configured.
 */
export async function sendReminderSMS(params: {
  to: string
  recipientName: string
  eventName: string
  eventDate: Date
  daysUntilEvent: number
}): Promise<string> {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const actualRecipient = isDevelopment && process.env.TEST_PHONE 
    ? process.env.TEST_PHONE 
    : params.to
  
  if (isDevelopment && process.env.TEST_PHONE) {
    console.log(`[Dev Mode] Redirecting SMS from ${params.to} to ${actualRecipient}`)
  }

  const twilioClient = getTwilio()
  const formattedDate = format(new Date(params.eventDate), 'MMM d, yyyy')
  const daysText = params.daysUntilEvent === 1 ? 'tomorrow' : `in ${params.daysUntilEvent} days`

  const message = await twilioClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: actualRecipient,
    body: `🎉 Reminder: ${params.eventName} is ${daysText} (${formattedDate})! - CircleDay`,
  })

  return message.sid
}

/**
 * Log reminder execution to database
 */
export async function logReminderSent(params: {
  eventId: string
  recipientEmail: string
  channels: string[]
  status: string
}): Promise<void> {
  // TODO: Implement actual DB logging when ScheduledSend/SendLog integration is complete
  console.log('[Activity] Reminder sent:', {
    eventId: params.eventId,
    recipientEmail: params.recipientEmail,
    channels: params.channels,
    status: params.status,
    sentAt: new Date(),
  })
  
  // Example implementation:
  // await db.sendLog.create({
  //   data: {
  //     scheduledSendId: '...',
  //     channel: params.channels[0],
  //     status: 'SENT',
  //     sentAt: new Date(),
  //   }
  // })
}
