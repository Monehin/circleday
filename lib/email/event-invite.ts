/**
 * Event Invite Email Template
 * 
 * Sends an email to a contact with a link to add their own events.
 */

import { resend, FROM_EMAIL } from './client'
import { EventInviteEmail } from './templates/event-invite'

interface EventInviteEmailProps {
  to: string
  contactName: string
  groupName: string
  inviteUrl: string
  expiresAt: Date
}

/**
 * Send event invite email
 */
export async function sendEventInviteEmail(props: EventInviteEmailProps) {
  const { to, contactName, groupName, inviteUrl, expiresAt } = props

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${groupName} wants to celebrate your special days! 🎉`,
      react: EventInviteEmail({ contactName, groupName, inviteUrl, expiresAt }),
    })

    console.log(`Event invite email sent to ${to}:`, result)
    return result
  } catch (error) {
    console.error(`Failed to send event invite email to ${to}:`, error)
    throw error
  }
}
