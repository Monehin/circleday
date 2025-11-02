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

interface MagicLinkEmailProps {
  magicLink: string
}

export function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to CircleDay</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Sign in to CircleDay</Heading>
          
          <Text style={text}>
            Click the button below to sign in to your CircleDay account.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              Sign in to CircleDay
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          
          <Link href={magicLink} style={link}>
            {magicLink}
          </Link>

          <Text style={footer}>
            This link will expire in 15 minutes. If you didn't request this email,
            you can safely ignore it.
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
}

const h1 = {
  color: '#FF7A39', // celebration-500
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#334155', // depth-700
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '0 0 10px 0',
  padding: '0 40px',
}

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#FF7A39', // celebration-500
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
}

const link = {
  color: '#FF7A39',
  fontSize: '12px',
  textAlign: 'center' as const,
  display: 'block',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#64748B', // depth-500
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '20px 0 0 0',
  padding: '0 40px',
}

