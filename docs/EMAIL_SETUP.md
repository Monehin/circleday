# Email Setup Guide (Resend)

## Why emails aren't sending

If you're not receiving magic link emails, it's likely because:

1. **Domain not verified** - Resend requires domain verification to send emails
2. **Sandbox mode** - Free tier only sends to verified email addresses
3. **Invalid API key** - Check your Resend dashboard

## Quick Fix for Development

### Option 1: Use Resend Test Mode (Easiest)

1. Go to https://resend.com/emails
2. Add your email to "Verified Recipients"
3. Now magic links will be sent to your email

### Option 2: Verify Your Domain

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Add your domain (e.g., `circleday.app`)
4. Follow DNS verification steps
5. Update `.env`:
   ```bash
   RESEND_FROM_EMAIL="noreply@yourdomain.com"
   ```

### Option 3: Development Mode (Console Logs)

For local development without email:

```typescript
// lib/email/magic-link.ts
export async function sendMagicLinkEmail(
  email: string,
  url: string,
  token: string
): Promise<void> {
  // Development mode: log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Magic Link Email')
    console.log('To:', email)
    console.log('Link:', url)
    console.log('Token:', token)
    return
  }
  
  // Production: send via Resend
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
```

## Current Configuration

Your `.env` file has:
```bash
RESEND_API_KEY="re_3BK6Wqid_7vXBvkLz9YT7365bKfpdsYTe"
RESEND_FROM_EMAIL="noreply@circleday.app"
```

## Steps to Fix

1. **Check Resend Dashboard**: https://resend.com/emails
2. **Verify your email** in the dashboard
3. **Try logging in again**
4. **Check server logs** for errors

## Alternative: Development Mode

For now, I can enable development mode that logs magic links to the console instead of sending emails. This is perfect for local development.

Would you like me to:
- ✅ Enable console logging for development
- ✅ Keep email sending for production
- ✅ Show you the magic link in the terminal

