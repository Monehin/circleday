# Phase 1: Database Logging & SMS Integration - Setup Guide

This document describes the setup required for Phase 1 enhancements: Database Logging Integration and SMS Notifications.

## 🚀 What's New in Phase 1

### 1. **Database Logging** (Production-Ready Reliability)
- All scheduled reminders are now stored in the database
- Full send history with delivery tracking
- Automatic retry logic for failed sends
- Suppression list support (bounces, unsubscribes)
- Idempotency to prevent duplicate sends

### 2. **SMS Notifications** (Twilio Integration)
- Send reminders via SMS in addition to email
- Phone number validation and formatting (E.164)
- SMS templates for reminders, updates, and invites
- Development mode with console logging
- Production-ready with Twilio credentials

---

## 📋 Environment Variables

### SMS Integration (Twilio)

Add these to your `.env.local` file to enable SMS notifications:

```bash
# Twilio Configuration (Optional - SMS will be disabled without these)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567  # Your Twilio phone number in E.164 format
```

**How to Get Twilio Credentials:**
1. Sign up at https://www.twilio.com/try-twilio
2. Get $15 free credit (enough for ~500 SMS messages in the US)
3. Find your credentials at https://console.twilio.com/
   - Account SID: `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Auth Token: Click "Show" to reveal
4. Buy a phone number at https://console.twilio.com/us1/develop/phone-numbers/manage/search
   - Choose a number with SMS capability
   - Copy the number in E.164 format (e.g., `+14155551234`)

**Development Mode:**
- SMS will work without Twilio credentials in development
- Messages will be logged to the console instead of sending
- Perfect for testing without spending credits

---

## 🎯 How It Works

### Reminder Scheduling (Two-Phase Process)

The cron job now runs in two phases:

#### Phase 1: Schedule Upcoming Reminders
```typescript
// Creates ScheduledSend records for the next 30 days
// - Checks reminder rules against upcoming events
// - Creates database records for each reminder to be sent
// - Skips suppressed recipients (bounces, unsubscribes)
// - Uses idempotency keys to prevent duplicates
```

#### Phase 2: Process Today's Reminders
```typescript
// Processes all pending reminders for today
// - Fetches ScheduledSend records due today
// - Sends emails and SMS messages
// - Creates SendLog entries for tracking
// - Updates ScheduledSend status (SENT, FAILED, etc.)
// - Retries failed sends (up to 3 attempts)
```

### Database Tables

**ScheduledSend** - Tracks all scheduled reminders
```sql
CREATE TABLE scheduled_sends (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  target_date TIMESTAMP NOT NULL,    -- Event date (YYYY-MM-DD)
  offset INTEGER NOT NULL,            -- -7, -1, 0, etc.
  channel TEXT NOT NULL,              -- EMAIL or SMS
  due_at_utc TIMESTAMP NOT NULL,      -- When to send (UTC)
  status TEXT NOT NULL,               -- PENDING, SENT, FAILED, etc.
  idempotency_key TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMP,
  failed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  ...
);
```

**SendLog** - Tracks send attempts and results
```sql
CREATE TABLE send_logs (
  id TEXT PRIMARY KEY,
  scheduled_send_id TEXT NOT NULL,
  provider TEXT NOT NULL,            -- "resend" or "twilio"
  provider_message_id TEXT,          -- ID from provider
  status TEXT NOT NULL,              -- SENT, FAILED, DELIVERED, BOUNCED
  error TEXT,
  delivered_at TIMESTAMP,
  bounced_at TIMESTAMP,
  ...
);
```

**Suppression** - Tracks recipients to skip
```sql
CREATE TABLE suppressions (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,             -- EMAIL or SMS
  identifier TEXT NOT NULL,          -- email or phone
  reason TEXT NOT NULL,              -- BOUNCE, COMPLAINT, UNSUBSCRIBE, STOP
  ...
);
```

---

## 🧪 Testing

### Unit Tests (26 New Tests)

**Scheduler Tests** (`__tests__/lib/services/reminder-scheduler.test.ts`)
- ✅ scheduleUpcomingReminders schedules reminders for upcoming events
- ✅ scheduleUpcomingReminders skips suppressed recipients
- ✅ scheduleUpcomingReminders skips events outside 30-day window
- ✅ scheduleUpcomingReminders handles multiple channels (EMAIL + SMS)
- ✅ getPendingScheduledSendsForToday returns pending scheduled sends
- ✅ getFailedSendsToRetry returns failed sends with retry count under max
- ✅ getSchedulerStats returns scheduler statistics

**SMS Client Tests** (`__tests__/lib/sms/client.test.ts`)
- ✅ Phone number formatting (E.164)
- ✅ Phone number validation
- ✅ Handles international numbers
- ✅ Edge cases (min/max lengths)

**SMS Templates Tests** (`__tests__/lib/sms/templates/reminder.test.ts`)
- ✅ Reminder SMS generation
- ✅ Event update SMS
- ✅ Group invite SMS
- ✅ Message conciseness and readability

### E2E Tests (Updated)

**Cron Job Tests** (`e2e/cron.spec.ts`)
- ✅ GET endpoint in development
- ✅ POST endpoint processing
- ✅ Response structure validation (scheduling + sending stats)

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e -- --project=chromium

# All tests
npm test && npm run test:e2e -- --project=chromium
```

---

## 📝 Example SMS Messages

### Birthday Reminder (T-3)
```
[Family] 📅 John Doe's birthday is in 3 days (Dec 25)

View in CircleDay: https://circleday.app
```

### Event Today (T-0)
```
[Work Team] 🎉 Today is Jane's anniversary! (Nov 3)

View in CircleDay: https://circleday.app
```

### Group Invitation
```
Alice invited you to join "My Family" on CircleDay!

Join here: https://circleday.app/invite/abc123
```

---

## 🚀 Production Deployment

### Vercel Environment Variables

Add these to your Vercel project settings:

```bash
# SMS (Optional)
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Existing variables (already set)
DATABASE_URL=your_neon_connection_string
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CRON_SECRET=your_secure_random_string
```

### QStash Cron Job

The cron endpoint now returns enhanced statistics:

```json
{
  "success": true,
  "message": "Reminders processed successfully",
  "scheduling": {
    "scheduled": 45,
    "skipped": 3,
    "errors": 0
  },
  "sending": {
    "total": 12,
    "sent": 11,
    "failed": 1
  },
  "errors": ["Failed to send reminder abc123: Network error"]
}
```

---

## 🎯 What's Next

**Completed in Phase 1:**
- ✅ Database logging integration
- ✅ SMS notifications (Twilio)
- ✅ Retry logic for failed sends
- ✅ Suppression list checking
- ✅ Comprehensive testing

**Future Enhancements:**
- ⏳ Timezone-aware sending (multiple daily cron runs)
- ⏳ Reminder history dashboard (UI to view sent reminders)
- ⏳ Notification preferences (per-user settings)
- ⏳ Wish Wall & Gift Coordination
- ⏳ Analytics Dashboard

---

## 📚 Related Documentation

- [Reminder Scheduling System](./REMINDER_SCHEDULING.md) - Full system documentation
- [Implementation Status](../IMPLEMENTATION_STATUS.md) - Overall project status
- [Test Coverage](../TEST_COVERAGE.md) - Complete test documentation

---

## 🤝 Support

If you encounter issues:
1. Check the console for detailed error messages
2. Verify environment variables are set correctly
3. Test SMS in development mode first (without Twilio)
4. Review the test suite for examples

**Common Issues:**
- "SMS not enabled": Twilio credentials not configured (expected in dev)
- "Invalid phone number": Phone must be in E.164 format (+15551234567)
- "Twilio authentication failed": Check ACCOUNT_SID and AUTH_TOKEN
- "From number not verified": Verify your Twilio phone number first

