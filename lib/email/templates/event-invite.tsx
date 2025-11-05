import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { format } from 'date-fns'

interface EventInviteEmailProps {
  contactName: string
  groupName: string
  inviteUrl: string
  expiresAt: Date
}

export function EventInviteEmail({
  contactName,
  groupName,
  inviteUrl,
  expiresAt,
}: EventInviteEmailProps) {
  const expiryDate = format(expiresAt, 'MMMM d, yyyy')
  const previewText = `${groupName} wants to celebrate your special days!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>🎉 CircleDay</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {contactName}!</Text>

            <Text style={paragraph}>
              {groupName} wants to celebrate your special days and make sure they never miss
              an important occasion.
            </Text>

            <Text style={paragraph}>
              Please take a moment to add your birthday, anniversary, and any other special
              dates you'd like to share with the group. This helps everyone stay connected
              and celebrate together!
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={inviteUrl}>
                Add My Special Days
              </Button>
            </Section>

            <Text style={smallText}>
              Or copy and paste this URL into your browser:
            </Text>
            <Text style={linkText}>
              <Link href={inviteUrl} style={link}>
                {inviteUrl}
              </Link>
            </Text>

            <Hr style={divider} />

            <Text style={footerText}>
              This link will expire on <strong>{expiryDate}</strong>.
            </Text>

            <Text style={footerText}>
              Your information will be kept private and only shared with members of {groupName}.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerSmall}>
              Powered by CircleDay - Never miss a celebration
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ============================================================================
// Styles
// ============================================================================

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
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const header = {
  padding: '24px 24px 0',
  textAlign: 'center' as const,
}

const headerText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#7c3aed',
  margin: '0',
}

const content = {
  padding: '0 48px',
}

const greeting = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginTop: '32px',
  marginBottom: '16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginBottom: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const smallText = {
  fontSize: '14px',
  color: '#737373',
  marginTop: '24px',
  marginBottom: '8px',
}

const linkText = {
  fontSize: '14px',
  wordBreak: 'break-all' as const,
  marginBottom: '24px',
}

const link = {
  color: '#7c3aed',
  textDecoration: 'underline',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
}

const footerText = {
  fontSize: '14px',
  color: '#737373',
  marginBottom: '12px',
  lineHeight: '20px',
}

const footer = {
  padding: '0 48px',
  marginTop: '32px',
}

const footerSmall = {
  fontSize: '12px',
  color: '#a3a3a3',
  textAlign: 'center' as const,
  margin: '0',
}

