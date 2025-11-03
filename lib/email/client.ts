import { Resend } from 'resend'

// Use a dummy API key for test/dev environments to prevent initialization errors
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dummy_key_for_testing'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not configured - emails will fail')
} else {
  console.log('✅ RESEND_API_KEY configured (starts with:', RESEND_API_KEY.substring(0, 7) + '...)')
}

export const resend = new Resend(RESEND_API_KEY)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@circleday.app'

console.log('📧 Email client initialized')
console.log('   FROM_EMAIL:', FROM_EMAIL)
console.log('   Has API Key:', !!process.env.RESEND_API_KEY)

