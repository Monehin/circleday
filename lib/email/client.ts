import { Resend } from 'resend'

// Use a dummy API key for test/dev environments to prevent initialization errors
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dummy_key_for_testing'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not configured - emails will fail')
}

export const resend = new Resend(RESEND_API_KEY)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@circleday.app'

