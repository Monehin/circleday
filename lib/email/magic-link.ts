import { resend, FROM_EMAIL } from './client'
import { MagicLinkEmail } from './templates/magic-link'

export async function sendMagicLinkEmail(
  email: string,
  url: string,
  token: string
): Promise<void> {
  // Development mode: log magic link to console
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔐 ===== MAGIC LINK EMAIL =====')
    console.log('📧 To:', email)
    console.log('🔗 Link:', url)
    console.log('🎫 Token:', token)
    console.log('=============================\n')
    console.log('👆 Copy the link above and paste it in your browser to sign in')
    console.log('')
    return
  }

  // Production mode: send via Resend
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

