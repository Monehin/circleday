# Documentation

Technical documentation for CircleDay.

## Getting Started

- **[Quick Start](../QUICK_START_PRODUCTION.md)** - 30-minute production setup
- **[Deployment Guide](../DEPLOYMENT.md)** - Complete deployment instructions
- **[Testing Guide](TESTING_GUIDE.md)** - Running and writing tests

## Features

- **[Event Invite Links](EVENT_INVITE_FEATURE.md)** - Public event submission forms
- **[Group Types](../GROUP_TYPES_IMPLEMENTATION.md)** - PERSONAL vs TEAM groups

## Infrastructure

- **[Email Configuration](EMAIL_SETUP.md)** - Setting up Resend for emails
- **[Rate Limiting](RATE_LIMITING.md)** - API rate limiting configuration
- **[Performance Optimization](NEXTJS_16_CACHE_OPTIMIZATION.md)** - Next.js 16 caching strategies

## Temporal & Workflows

- **[API Key Setup](../TEMPORAL_API_KEY_SETUP.md)** - Temporal Cloud authentication
- **[VPS Worker Setup](../VPS_SETUP_CHECKLIST.md)** - Worker configuration
- **[Workflow Tests](__tests__/temporal/workflows.test.ts)** - Testing Temporal workflows

## Database

- **Schema**: Run `npx prisma studio` to explore
- **Migrations**: `npx prisma migrate dev`
- **Seeds**: See `prisma/seeds/README.md`

## API Reference

### Server Actions

Located in `lib/actions/`:
- `groups.ts` - Group management
- `events.ts` - Event operations
- `events-bulk.ts` - Bulk event creation
- `reminders.ts` - Reminder configuration
- `profile.ts` - User profile management

### Temporal Workflows

Located in `temporal/workflows/`:
- `reminder.workflow.ts` - Main reminder workflow

### Temporal Activities

Located in `temporal/activities/`:
- `reminder.activities.ts` - Email/SMS sending, logging

## Architecture Decisions

### Why Temporal?

Replaced QStash cron jobs with Temporal for:
- **Durable execution**: Workflows survive restarts
- **Automatic retries**: Built-in retry policies
- **Pause/resume**: Dynamic workflow control
- **Better testing**: Time-travel testing support

### Why Separate Worker?

The worker runs on a VPS instead of Vercel because:
- **Long-running processes**: Workers poll continuously
- **Reliability**: Not subject to serverless timeouts
- **Cost-effective**: VPS pricing vs serverless invocations
- **Resource control**: Dedicated CPU/memory

### Database Design

- **Soft deletes**: `deletedAt` field for data retention
- **Audit logs**: Complete operation history
- **Idempotency**: `ScheduledSend.idempotencyKey` prevents duplicates
- **Timezone support**: All dates stored in UTC

## Troubleshooting

### Common Issues

**Worker not connecting:**
```bash
# Check environment variables
cat .env.production | grep TEMPORAL

# Verify Temporal API key
echo $TEMPORAL_API_KEY
```

**Database connection failed:**
```bash
# Test connection
npx prisma db pull
```

**Emails not sending:**
- Verify Resend API key is valid
- Check sender email is verified in Resend dashboard
- Review Resend logs for delivery status

### Logs

**Vercel (Next.js):**
- Dashboard → Your Project → Deployments → View Function Logs

**Worker:**
```bash
ssh root@your-vps-ip
cd /opt/circleday-worker
docker-compose logs -f worker
```

**Temporal Cloud:**
- https://cloud.temporal.io → Your namespace → Workflows

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   npm test
   npm run type-check
   ```

3. **Commit and push**
   ```bash
   git commit -m "Add feature"
   git push origin feature/your-feature
   ```

4. **Merge to main**
   - GitHub Actions automatically deploys worker
   - Vercel automatically deploys Next.js app

## Additional Resources

- **Temporal Docs**: https://docs.temporal.io
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Better Auth Docs**: https://www.better-auth.com/docs

---

For questions or issues, please open a GitHub issue.

