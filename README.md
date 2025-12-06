# CircleDay

Never miss a celebration. CircleDay is a celebration management platform that helps teams and individuals remember and celebrate important dates.

## Features

- **Event Management**: Track birthdays, anniversaries, and custom celebrations
- **Automated Reminders**: Durable workflow orchestration via Temporal
- **Multi-Channel Notifications**: Email and SMS reminders
- **Group Organization**: PERSONAL and TEAM group types
- **Timezone-Aware Scheduling**: Respects user timezones
- **Event Invite Links**: Public forms for collecting celebration dates
- **Audit Trail**: Complete history of all reminder sends

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Database** | PostgreSQL (Neon) + Prisma ORM |
| **Authentication** | Better Auth |
| **Workflows** | Temporal Cloud |
| **UI** | Tailwind CSS, shadcn/ui, Framer Motion |
| **Email** | Resend |
| **SMS** | Twilio |
| **Testing** | Vitest (133 tests), Playwright (26 E2E tests) |

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL database
- Temporal (Docker for local, Cloud for production)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/circleday.git
cd circleday

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma migrate dev
npx prisma generate

# Start local Temporal server (Docker required)
npm run temporal:start

# Start development servers
npm run dev
```

Visit `http://localhost:3000`

## Configuration

### Environment Variables

#### Required

```bash
DATABASE_URL=postgresql://user:pass@host:5432/circleday
BETTER_AUTH_SECRET=generate-32-char-secret
BETTER_AUTH_URL=http://localhost:3000
```

#### Temporal

**Local development:**
```bash
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
USE_TEMPORAL=true
```

**Production (Temporal Cloud):**
```bash
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=your-namespace.account.tmprl.cloud:7233
TEMPORAL_NAMESPACE=your-namespace
TEMPORAL_API_KEY=tmprl-your-api-key
```

#### Notifications

```bash
# Email (Resend)
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=CircleDay <hello@yourdomain.com>

# SMS (Twilio, optional)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Development

### Available Commands

```bash
# Development
npm run dev              # Next.js + Worker
npm run dev:next         # Next.js only
npm run dev:worker       # Worker only
npm run build            # Production build
npm run start            # Start production server

# Temporal
npm run temporal:start   # Start local Temporal
npm run temporal:stop    # Stop local Temporal
npm run temporal:worker  # Start worker
npm run temporal:ui      # Open Temporal UI

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests
npm run type-check       # TypeScript validation
npm run lint             # ESLint

# Database
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate client
```

### Project Structure

```
circleday/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard components
│   └── events/           # Event components
├── temporal/              # Temporal workflows
│   ├── workflows/        # Workflow definitions
│   ├── activities/       # Activity implementations
│   └── client.ts         # Temporal client
├── lib/
│   ├── actions/          # Server Actions
│   ├── services/         # Business logic
│   ├── db/              # Prisma client
│   └── auth/            # Auth configuration
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration history
│   └── seeds/           # Seed data
└── scripts/
    └── temporal-worker.ts  # Worker entry point
```

## Testing

```bash
# Unit tests (133 passing)
npm test

# E2E tests (26 passing)
npm run test:e2e

# Type checking
npm run type-check

# All checks
npm run test:all
```

**Test coverage:**
- Server Actions (groups, events, reminders)
- Business logic (scheduler, sender)
- Temporal workflows
- UI components
- Full user flows (E2E)

## Deployment

### Architecture

```
Vercel (Next.js) ──► Temporal Cloud ◄── VPS (Worker)
       │
       └─► Neon (Database)
```

### Quick Deploy

1. **Vercel**: Deploy Next.js application
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Temporal Cloud**: Setup namespace and API key
   - See `TEMPORAL_API_KEY_SETUP.md`

3. **VPS**: Deploy worker
   - See `VPS_SETUP_CHECKLIST.md`

4. **GitHub Actions**: Auto-deployment configured
   - See `.github/workflows/build-and-deploy-worker.yml`

**Complete guide**: See `DEPLOYMENT.md`

## Group Types

CircleDay supports two group types:

| Type | Description | Use Case |
|------|-------------|----------|
| **PERSONAL** | Owner receives all reminders | Manager tracking team birthdays |
| **TEAM** | Members remind each other | Family/friend group celebrations |

Details: `GROUP_TYPES_IMPLEMENTATION.md`

## Documentation

Start here: `DOCUMENTATION_INDEX.md`

### Quick links
- `QUICK_START_PRODUCTION.md` – 30‑minute production setup
- `DEPLOYMENT.md` – Complete deployment guide
- `TEMPORAL_API_KEY_SETUP.md` – Temporal Cloud authentication
- `VPS_SETUP_CHECKLIST.md` – VPS worker configuration
- `.github/workflows/README.md` – CI/CD documentation
- `GROUP_TYPES_IMPLEMENTATION.md` – Group types feature
- `prisma/seeds/README.md` – Demo data guide

## Database

**Schema**: 21 models organized across authentication, groups, events, and reminders

**Key models:**
- User, Session, Account (authentication)
- Group, Membership, Contact (organization)
- Event, ReminderRule, ScheduledSend (reminders)
- EventInviteToken, AuditLog, Suppression (tracking)

**Features:**
- 20+ optimized indexes
- Soft delete support
- Complete audit trail
- Type-safe enums

View schema: `npx prisma studio`

## Security

- CSP, HSTS, and security headers
- Rate limiting on all endpoints
- Magic link authentication
- Audit trail for all operations
- Input validation (Zod)
- SQL injection protection (Prisma)
- Environment-based configuration

## Performance

- Server-side rendering (Next.js)
- Optimistic UI updates
- Database connection pooling
- Efficient query patterns
- CDN asset delivery (Vercel)
- Workflow retries (Temporal)

## Contributing

This is a private project. For bug reports or feature requests, please open an issue.

### Development Standards

- TypeScript strict mode
- Comprehensive test coverage
- Server Actions over API routes
- Component composition patterns
- Semantic HTML and accessibility

## License

Private - All rights reserved

## Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs` directory
- **Health Check**: `/api/health`

---

Built with Next.js 16, React 19, Temporal, and modern web technologies.
