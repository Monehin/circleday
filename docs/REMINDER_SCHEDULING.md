# Reminder Scheduling System

## Overview

CircleDay's reminder scheduling system automatically sends email notifications to users based on their configured reminder rules. The system runs daily and calculates which events have upcoming celebrations.

## Architecture

```
┌─────────────────┐
│  Daily Cron Job │ (9 AM UTC)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Reminder Calculator     │
│ - Fetch all rules       │
│ - Find matching events  │
│ - Calculate offsets     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Reminder Sender         │
│ - Send emails           │
│ - Log results           │
│ - Handle errors         │
└─────────────────────────┘
```

## Components

### 1. Reminder Calculator (`lib/services/reminder-calculator.ts`)

Calculates which reminders should be sent today:
- Fetches all active reminder rules
- Gets events from group members
- Calculates next occurrence for recurring events
- Matches event dates against rule offsets
- Returns list of reminders to send

### 2. Reminder Sender (`lib/services/reminder-sender.ts`)

Sends reminder emails and logs results:
- Sends emails via Resend (or logs in development)
- Tracks sent/failed status in database
- Provides history and statistics

### 3. Cron Job Endpoint (`app/api/cron/send-reminders/route.ts`)

API endpoint triggered daily:
- Secured with CRON_SECRET in production
- Calls reminder calculator and sender
- Returns processing statistics

### 4. Email Template (`lib/email/templates/reminder.tsx`)

Beautiful HTML email template:
- Shows event details (name, date, type)
- Displays countdown (days until)
- Provides actionable tips
- Links to CircleDay app

## Setup

### Environment Variables

Add to your `.env` file:

```bash
# Cron job secret (generate a random string)
CRON_SECRET=your-random-secret-string

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Resend API key (for sending emails)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=notifications@your-domain.com
```

### Option 1: Using QStash (Recommended for Production)

**Why QStash?**
- Reliable background job processing
- Built-in retries and dead letter queues
- Serverless-friendly
- Free tier: 500 requests/day

**Setup:**

1. Sign up for Upstash: https://console.upstash.com/
2. Create a new QStash project
3. Add your endpoint:
   - URL: `https://your-domain.com/api/cron/send-reminders`
   - Method: POST
   - Schedule: `0 9 * * *` (daily at 9 AM UTC)
   - Headers: 
     - `Authorization: Bearer ${CRON_SECRET}`

4. Configure QStash signature verification (optional but recommended):

```typescript
// In app/api/cron/send-reminders/route.ts
import { verifySignature } from '@upstash/qstash/nextjs'

export const POST = verifySignature(async (request: NextRequest) => {
  // Your handler code
})
```

### Option 2: Using Vercel Cron Jobs

**Note:** Vercel Cron requires a Pro plan.

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Option 3: External Cron Service

Use any cron service (cron-job.org, EasyCron, etc.) to make a daily POST request:

```bash
curl -X POST https://your-domain.com/api/cron/send-reminders \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

## Usage

### Development Testing

In development mode, you can trigger the cron manually:

```bash
# Using GET (dev only)
curl http://localhost:3000/api/cron/send-reminders

# Or using POST
curl -X POST http://localhost:3000/api/cron/send-reminders
```

Output:
```json
{
  "success": true,
  "message": "Reminders processed successfully",
  "stats": {
    "total": 5,
    "sent": 5,
    "failed": 0
  }
}
```

### Production Monitoring

Check reminder statistics:

```typescript
import { getReminderSendingStats } from '@/lib/services/reminder-sender'

const stats = await getReminderSendingStats()
// {
//   totalSent: 1234,
//   totalFailed: 12,
//   successRate: "99.03",
//   recentSends: [...]
// }
```

## How It Works

### Example: Birthday Reminder

**Scenario:**
- User creates a group "Family"
- Adds contact "Mom" with birthday on March 15, 1980
- Configures reminder rule:
  - T-7 days: Email
  - T-1 day: Email
  - T-0 day: Email + SMS

**Timeline:**

**March 8** (T-7):
1. Cron job runs at 9 AM UTC
2. Calculator finds Mom's birthday is 7 days away
3. Matches offset -7 in reminder rule
4. Sends email to all group members
5. Logs send to database

**March 14** (T-1):
1. Cron job runs at 9 AM UTC
2. Calculator finds Mom's birthday is 1 day away
3. Matches offset -1 in reminder rule
4. Sends email to all group members
5. Logs send to database

**March 15** (T-0):
1. Cron job runs at 9 AM UTC
2. Calculator finds Mom's birthday is today
3. Matches offset 0 in reminder rule
4. Sends email to all group members
5. (SMS sending requires Twilio setup)
6. Logs send to database

### Recurring Events

For recurring events (birthdays, anniversaries):
- System calculates next occurrence based on current year
- If date has passed this year, uses next year
- Handles leap year birthdays (Feb 29)

### Non-Recurring Events

For one-time events:
- Uses the exact date specified
- Does not repeat after the event date

## Database Schema

### SendLog Table

Tracks all reminder sends:

```prisma
model SendLog {
  id             String    @id @default(cuid())
  eventId        String
  recipientEmail String
  channel        String    // EMAIL or SMS
  status         String    // SENT or FAILED
  sentAt         DateTime?
  error          String?
  metadata       Json?     // Additional context
  createdAt      DateTime  @default(now())
  
  event Event @relation(fields: [eventId], references: [id])
}
```

## Error Handling

The system is designed to be resilient:

1. **Individual failures don't stop processing**
   - If one email fails, others continue
   - Failed sends are logged for retry

2. **Graceful degradation**
   - In development, reminders are logged to console
   - Missing API keys won't crash the system

3. **Comprehensive logging**
   - All sends tracked in database
   - Errors captured with full context
   - Statistics available for monitoring

## Future Enhancements

- [ ] SMS reminders via Twilio
- [ ] Timezone-aware sending (send at user's local time)
- [ ] Manual retry for failed sends
- [ ] Webhook notifications for failed sends
- [ ] Dashboard for monitoring send statistics
- [ ] Rate limiting for large user bases
- [ ] Batch sending for performance

## Troubleshooting

### Reminders not being sent

1. Check cron job is running:
   - QStash: Check logs in Upstash console
   - Vercel: Check deployment logs

2. Verify environment variables:
   - `CRON_SECRET` is set
   - `RESEND_API_KEY` is valid
   - `NEXT_PUBLIC_APP_URL` is correct

3. Check SendLog table for errors:
   ```typescript
   const failed = await db.sendLog.findMany({
     where: { status: 'FAILED' },
     orderBy: { createdAt: 'desc' },
     take: 10
   })
   ```

### Testing locally

1. Create test data:
   - Add a group
   - Add a member with an event tomorrow
   - Create a reminder rule with offset -1

2. Trigger cron manually:
   ```bash
   curl http://localhost:3000/api/cron/send-reminders
   ```

3. Check console for log output

## Support

For issues or questions:
- Check SendLog table for errors
- Review Resend dashboard for email delivery
- Contact support at support@circleday.app

