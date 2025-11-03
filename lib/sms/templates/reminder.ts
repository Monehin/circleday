import { format } from 'date-fns'

export interface ReminderSMSParams {
  contactName: string
  eventType: string
  eventTitle: string | null
  eventDate: Date
  daysUntil: number
  groupName: string
  appUrl?: string
}

/**
 * Generate SMS text for reminder notifications
 * SMS messages should be concise (ideally under 160 characters)
 */
export function generateReminderSMS(params: ReminderSMSParams): string {
  const {
    contactName,
    eventType,
    eventTitle,
    eventDate,
    daysUntil,
    groupName,
    appUrl = 'https://circleday.app',
  } = params

  const eventName = eventTitle || `${contactName}'s ${eventType.toLowerCase()}`
  const dateStr = format(eventDate, 'MMM d')

  // Build message based on days until
  let message = ''
  
  if (daysUntil === 0) {
    // Day of the event
    message = `🎉 Today is ${eventName}! (${dateStr})`
  } else if (daysUntil === 1) {
    // Tomorrow
    message = `⏰ Tomorrow is ${eventName}! (${dateStr})`
  } else if (daysUntil <= 7) {
    // Within a week
    message = `📅 ${eventName} is in ${daysUntil} days (${dateStr})`
  } else {
    // More than a week
    message = `📅 Reminder: ${eventName} is coming up on ${dateStr}`
  }

  // Add app link for quick access
  message += `\n\nView in CircleDay: ${appUrl}`

  // Add group context if not too long
  if (message.length < 140) {
    message = `[${groupName}] ${message}`
  }

  return message
}

/**
 * Generate SMS for event updates/changes
 */
export function generateEventUpdateSMS(params: {
  contactName: string
  eventType: string
  changeDescription: string
  groupName: string
}): string {
  const { contactName, eventType, changeDescription, groupName } = params
  
  return `[${groupName}] Update: ${contactName}'s ${eventType.toLowerCase()} - ${changeDescription}`
}

/**
 * Generate SMS for group invitations
 */
export function generateGroupInviteSMS(params: {
  groupName: string
  inviterName: string
  inviteLink: string
}): string {
  const { groupName, inviterName, inviteLink } = params
  
  return `${inviterName} invited you to join "${groupName}" on CircleDay!\n\nJoin here: ${inviteLink}`
}

