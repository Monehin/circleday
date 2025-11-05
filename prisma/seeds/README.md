# Group Types Demo Seed Data

This seed script demonstrates **PERSONAL** and **TEAM** group types with realistic data.

## Quick Start

```bash
# Run the seed
npx tsx prisma/seeds/group-types-demo.ts

# Login with your account
Email: e.monehin@live.com
Use magic link authentication
```

---

## What Gets Created

### Your Account
**📧 e.monehin@live.com** - Owner of "Tech Team Birthdays" (PERSONAL group)

You'll receive reminders for all 3 team members' events (2 birthdays, 1 work anniversary).

### 4 Demo Groups

| Group | Type | Purpose | Members |
|-------|------|---------|---------|
| **Tech Team Birthdays** | PERSONAL | You track team events | 4 (YOU + 3 team) |
| Marketing Department | PERSONAL | HR tracks dept events | 3 |
| Smith Family Circle | TEAM | Family mutual reminders | 4 |
| Johnson Family | TEAM | Family mutual reminders | 3 |

**Total:** 14 users, 13 events, 4 reminder rules

---

## Group Type Behavior

### PERSONAL Groups 👤
- **Only the owner** receives all reminders
- Use case: One person manages celebrations for others
- Example: Manager tracking team birthdays

### TEAM Groups 👥
- **All members** receive reminders
- **EXCEPT** the person being celebrated
- Use case: Groups where everyone participates
- Example: Family reminding each other

---

## Testing

### 1. View in UI
```bash
npm run dev
# Login with e.monehin@live.com
# Navigate to Groups → Tech Team Birthdays
```

### 2. Test Reminder Scheduler
```bash
npx tsx -e "import('./lib/services/reminder-scheduler').then(m => m.scheduleUpcomingReminders())"
```

This creates `ScheduledSend` records showing who receives which reminders.

### 3. Check Database
```sql
SELECT 
  u.name as recipient,
  c.name as event_person,
  g.name as group_name,
  g.type as group_type
FROM scheduled_sends ss
JOIN users u ON ss.recipientUserId = u.id
JOIN events e ON ss.eventId = e.id
JOIN contacts c ON e.contactId = c.id
JOIN groups g ON g.id IN (
  SELECT groupId FROM memberships WHERE contactId = c.id
)
WHERE ss.status = 'PENDING'
ORDER BY g.name;
```

---

## Upcoming Events

Events are created relative to today for immediate testing:

- **+5 days:** Dad's Birthday (Smith Family - TEAM)
- **+8 days:** Tom's Work Anniversary (Marketing - PERSONAL)
- **+10 days:** Mike's Birthday (Your Tech Team - PERSONAL)
- **+12 days:** David's Birthday (Johnson Family - TEAM)
- **+15 days:** Jamie's Birthday (Smith Family - TEAM)
- **+20 days:** Wedding Anniversary (Johnson Family - TEAM)

---

## Expected Behavior

### Your PERSONAL Group (Tech Team)
```
Event: Mike's Birthday in 10 days
Reminders sent to:
  ✅ YOU (e.monehin@live.com)
  
Members who DON'T receive:
  ❌ John, Emily, Mike
```

### TEAM Group Example (Smith Family)
```
Event: Dad's Birthday in 5 days
Reminders sent to:
  ✅ Mom, Alex, Jamie
  
Person who DOESN'T receive:
  ❌ Dad (the birthday person)
```

---

## Demo User Accounts

All accounts use magic link authentication:

**Your Account:**
- e.monehin@live.com (Tech Team owner)

**Other Demo Users:**
- john.dev@example.com
- emily.designer@example.com
- mike.lead@example.com
- dad.smith@example.com
- mom.smith@example.com
- alex.smith@example.com
- jamie.smith@example.com
- lisa.marketing@example.com
- tom.sales@example.com
- kate.content@example.com
- david.johnson@example.com
- susan.johnson@example.com
- peter.johnson@example.com

---

## Notes

- The seed preserves your account (e.monehin@live.com) on each run
- Re-running the seed recreates all demo data
- Your account will own the "Tech Team Birthdays" PERSONAL group
- You'll receive real reminder notifications if the scheduler runs

---

## Related Files

- Implementation: `lib/services/reminder-scheduler.ts`
- Tests: `__tests__/lib/services/group-types.test.ts`
- Documentation: `GROUP_TYPES_IMPLEMENTATION.md`
