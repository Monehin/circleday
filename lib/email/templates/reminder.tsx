import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { format } from 'date-fns'

interface ReminderEmailProps {
  recipientName: string
  contactName: string
  eventType: string
  eventTitle: string | null
  eventDate: Date
  daysUntil: number
  groupName: string
  appUrl: string
}

export function ReminderEmail({
  recipientName,
  contactName,
  eventType,
  eventTitle,
  eventDate,
  daysUntil,
  groupName,
  appUrl,
}: ReminderEmailProps) {
  const eventTypeLabel = eventType === 'BIRTHDAY' ? 'Birthday' 
    : eventType === 'ANNIVERSARY' ? 'Anniversary' 
    : 'Celebration'
  
  const eventName = eventTitle || `${contactName}'s ${eventTypeLabel}`
  
  const timeframeText = daysUntil === 0 
    ? 'Today!' 
    : daysUntil === 1 
    ? 'Tomorrow' 
    : `in ${daysUntil} days`
  
  const emoji = eventType === 'BIRTHDAY' ? '🎂' 
    : eventType === 'ANNIVERSARY' ? '💍' 
    : '🎉'

  return (
    <Html>
      <Head />
      <Preview>Reminder: {eventName} is {timeframeText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{emoji} Celebration Reminder</Heading>
          
          <Text style={text}>
            Hi {recipientName},
          </Text>

          <Text style={text}>
            This is a friendly reminder from your <strong>{groupName}</strong> group:
          </Text>

          <Section style={eventBox}>
            <Text style={eventTitle as React.CSSProperties}>
              {eventName}
            </Text>
            <Text style={eventDate as React.CSSProperties}>
              {format(new Date(eventDate), 'MMMM d, yyyy')}
            </Text>
            <Text style={eventTimeframe as React.CSSProperties}>
              {timeframeText}
            </Text>
          </Section>

          {daysUntil > 0 && (
            <Text style={text}>
              You still have time to prepare! Consider:
            </Text>
          )}

          {daysUntil > 0 && (
            <Section style={tipBox}>
              <Text style={tipText}>
                • Finding the perfect gift<br />
                • Writing a heartfelt message<br />
                • Planning a celebration<br />
                • Coordinating with others in your group
              </Text>
            </Section>
          )}

          {daysUntil === 0 && (
            <Text style={text}>
              Don't forget to wish {contactName} a wonderful day! 🎉
            </Text>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/groups`}>
              View in CircleDay
            </Button>
          </Section>

          <Text style={footer}>
            This reminder was sent by CircleDay based on your group's reminder settings.
            To manage your reminders, visit your{' '}
            <Link href={`${appUrl}/groups`} style={link}>
              groups page
            </Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#FF7A39',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '16px 40px',
}

const eventBox = {
  backgroundColor: '#FFF7ED',
  border: '2px solid #FF7A39',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 40px',
  textAlign: 'center' as const,
}

const eventTitle = {
  color: '#FF7A39',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const eventDate = {
  color: '#334155',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const eventTimeframe = {
  color: '#64748B',
  fontSize: '16px',
  margin: '0',
}

const tipBox = {
  backgroundColor: '#F0FDF4',
  border: '1px solid #86EFAC',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 40px',
}

const tipText = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const buttonContainer = {
  padding: '27px 40px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#FF7A39',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const link = {
  color: '#FF7A39',
  fontSize: '14px',
  textDecoration: 'underline',
}

const footer = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center' as const,
  margin: '20px 40px 0',
}

