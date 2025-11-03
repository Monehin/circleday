import { resend, FROM_EMAIL } from './client'
import { MagicLinkEmail } from './templates/magic-link'

export async function sendMagicLinkEmail(
  email: string,
  url: string,
  token: string
): Promise<void> {
  console.log('[Magic Link] Starting email send process...')
  console.log('[Magic Link] NODE_ENV:', process.env.NODE_ENV)
  console.log('[Magic Link] To:', email)
  console.log('[Magic Link] From:', FROM_EMAIL)
  
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
    console.log('[Magic Link] Sending email via Resend...')
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Sign in to CircleDay',
      react: MagicLinkEmail({ magicLink: url }),
    })
    console.log('[Magic Link] ✅ Email sent successfully!')
    console.log('[Magic Link] Resend response:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('[Magic Link] ❌ Failed to send email:', error)
    throw new Error('Failed to send magic link email')
  }
}

