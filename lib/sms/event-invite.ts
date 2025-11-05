/**
 * Event Invite SMS Template
 * 
 * Sends an SMS to a contact with a link to add their own events.
 */

import { twilioClient, TWILIO_PHONE_NUMBER, isSMSEnabled, formatPhoneNumber } from './client'

interface EventInviteSMSProps {
  to: string
  contactName: string
  groupName: string
  inviteUrl: string
}

/**
 * Generate event invite SMS message
 */
function generateEventInviteSMS({ contactName, groupName, inviteUrl }: Omit<EventInviteSMSProps, 'to'>): string {
  return `Hi ${contactName}! ${groupName} wants to celebrate your special days. Please add your birthday, anniversary, and other important dates: ${inviteUrl} 🎉`
}

/**
 * Send event invite SMS
 */
export async function sendEventInviteSMS(props: EventInviteSMSProps) {
  const { to, contactName, groupName, inviteUrl } = props

  if (!isSMSEnabled()) {
    console.warn('SMS is not enabled. Skipping SMS send.')
    return null
  }

  try {
    const formattedPhone = formatPhoneNumber(to)
    const message = generateEventInviteSMS({ contactName, groupName, inviteUrl })

    if (!twilioClient) {
      throw new Error('Twilio client not initialized')
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER!,
      to: formattedPhone,
    })

    console.log(`Event invite SMS sent to ${formattedPhone}:`, result.sid)
    return result
  } catch (error) {
    console.error(`Failed to send event invite SMS to ${to}:`, error)
    throw error
  }
}

