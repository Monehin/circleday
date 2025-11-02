import { resend, FROM_EMAIL } from './client'
import { MagicLinkEmail } from './templates/magic-link'

export async function sendMagicLinkEmail(
  email: string,
  url: string,
  token: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Sign in to CircleDay',
      react: MagicLinkEmail({ magicLink: url }),
    })
  } catch (error) {
    console.error('Failed to send magic link email:', error)
    throw new Error('Failed to send magic link email')
  }
}

