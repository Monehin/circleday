import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not configured - emails will fail')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@circleday.app'

