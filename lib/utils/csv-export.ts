import { format } from 'date-fns'
import { ScheduledSend, Event, Contact, SendLog } from '@prisma/client'

type ReminderWithDetails = ScheduledSend & {
  event: Event & {
    contact: Contact
  }
  sendLogs: SendLog[]
}

export function exportRemindersToCSV(reminders: ReminderWithDetails[], groupName: string) {
  // Define CSV headers
  const headers = [
    'Event',
    'Contact',
    'Channel',
    'Status',
    'Due Date',
    'Sent At',
    'Offset',
    'Retry Count',
    'Provider',
    'Message ID',
    'Error',
  ]

  // Convert reminders to CSV rows
  const rows = reminders.map((reminder) => {
    const eventTitle =
      reminder.event.title ||
      `${reminder.event.contact.name}'s ${reminder.event.type.toLowerCase()}`
    const latestLog = reminder.sendLogs[0]

    return [
      eventTitle,
      reminder.event.contact.name,
      reminder.channel,
      reminder.status,
      format(new Date(reminder.dueAtUtc), 'yyyy-MM-dd HH:mm'),
      reminder.sentAt ? format(new Date(reminder.sentAt), 'yyyy-MM-dd HH:mm') : 'N/A',
      `T${reminder.offset >= 0 ? '+' : ''}${reminder.offset}`,
      `${reminder.retryCount}/3`,
      latestLog?.provider || 'N/A',
      latestLog?.providerMessageId || 'N/A',
      latestLog?.error || 'N/A',
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `${groupName}-reminder-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
  )
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

