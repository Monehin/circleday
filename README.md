# CircleDay

**Never miss a celebration** 🎉

CircleDay is a celebration management platform that helps you remember and celebrate important dates with the people you care about. Built with exceptional design, timezone-aware reminders, and collaborative features.

---

## 🎯 What is CircleDay?

CircleDay makes it effortless to:
- **Remember** birthdays, anniversaries, and special occasions
- **Send** timely reminders via email and SMS
- **Collaborate** with groups to celebrate together
- **Engage** through wish walls and story prompts
- **Gift** with one-tap treats and group pots

### Key Features

**Core (MVP):**
- 🎂 Event management (birthdays, anniversaries, custom events)
- 👥 Group organization with member management
- ⏰ Timezone-aware reminder scheduling
- 📧 Email notifications with beautiful templates
- 🔒 Secure authentication (magic links, SMS OTP)

**Advanced:**
- 📱 Multi-channel notifications (email + SMS)
- 💬 Public wish walls for group messages
- 🎁 One-tap gifting with group pots
- 🔐 Step-up verification for sensitive actions
- 📊 Audit trail with rollback capability

---

## 🛠️ Tech Stack

**Framework & Language:**
- Next.js 16.0.1 (App Router, Server Actions)
- React 19.0.0 (Server Components)
- TypeScript 5.6+ (Strict mode)

**Database & ORM:**
- Neon Postgres (serverless PostgreSQL)
- Prisma 6 (type-safe ORM)

**Authentication:**
- Better Auth 1.0 (magic links, SMS OTP, step-up verification)

**UI & Styling:**
- Tailwind CSS 4 (custom CircleDay theme)
- shadcn/ui + Radix UI (accessible components)
- Framer Motion (animations)

**Infrastructure:**
- Upstash Redis (rate limiting, caching)
- Upstash QStash (job scheduling, retries)
- Resend (transactional emails)
- Twilio (SMS via A2P 10DLC)

**Payments & Gifting:**
- Stripe (payments, webhooks)
- Tango Card API (gift cards)

**Testing:**
- Vitest + React Testing Library (unit/integration)
- Playwright (E2E)
- MSW (API mocking)

**Observability:**
- Sentry (error tracking)
- Vercel Analytics
- Better Stack (uptime monitoring)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm 10+
- PostgreSQL database (we use Neon)
- Upstash account (Redis + QStash)
- Resend account (emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/[username]/circleday.git
cd circleday

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your credentials

# Run database migration
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Setup

Required environment variables (see `env.example`):

```bash
# Database
DATABASE_URL="your-neon-database-url"

# Upstash
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
QSTASH_URL="https://qstash.upstash.io"
QSTASH_TOKEN="your-qstash-token"

# Email
RESEND_API_KEY="your-resend-key"

# Auth (generate 32+ char secret)
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
```

---

## 📁 Project Structure

```
circleday/
├── app/                    # Next.js 16 app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes & webhooks
│   └── ...
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── actions/           # Server Actions
│   ├── db/                # Prisma client
│   ├── errors/            # Error handling
│   ├── rate-limit/        # Rate limiting
│   └── ...
├── prisma/
│   ├── schema.prisma      # Database schema (21 models)
│   └── migrations/        # Migration history
├── __tests__/             # Unit & integration tests
├── e2e/                   # E2E tests (Playwright)
└── docs/                  # Documentation
```

---

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all

# Type checking
npm run type-check
```

**Current Status:** ✅ 47/47 tests passing

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm test             # Run unit tests (Vitest)
npm run test:ui      # Test UI (interactive)
npm run test:coverage # Run with coverage report
npm run test:e2e     # E2E tests (Playwright)
npm run test:all     # All tests

# Database
npx prisma migrate dev    # Create & run migration
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open database GUI
npx prisma db push        # Push schema without migration
```

---

## 🗄️ Database

**Models:** 21 total across all phases

**Core Models:**
- User, Session, Account (authentication)
- Group, Membership, Contact (organization)
- Event, ReminderRule, ScheduledSend (scheduling)
- SendLog, Suppression, AuditLog (tracking)

**Future Phases:**
- WishWallMessage, InviteLink, ProposedChange
- NudgeCircle, Order, Pot, and more

**Features:**
- 20+ strategic indexes for performance
- Soft delete support (`deletedAt`)
- Full audit trail
- Type-safe enums

---

## 🔒 Security Features

- **Security Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting:** Upstash-backed rate limits on all endpoints
- **Error Handling:** Centralized error handling with Sentry integration
- **Authentication:** Magic links, SMS OTP, step-up verification
- **Audit Trail:** Track all changes with rollback capability
- **Input Validation:** Zod schemas for all user inputs

---

## 📚 Documentation

- **`IMPLEMENTATION_STATUS.md`** - Current development status & progress
- **`docs/AGILE_IMPLEMENTATION_PLAN.md`** - Epics, User Stories, Tasks
- **`docs/PLAN.md`** - Comprehensive technical plan & architecture
- **`docs/TEST_REPORT.md`** - Test results & coverage
- **`docs/RATE_LIMITING.md`** - Rate limiting setup & usage

---

## 🏗️ Development Status

**Current Phase:** Epic 1 Complete - Epic 2 Starting  
**Completion:** Foundation 100%, Overall ~15%  
**Timeline:** 10-14 weeks to MVP

See `IMPLEMENTATION_STATUS.md` for detailed progress.

---

## 🎨 Design System

**CircleDay Theme:**
- **Celebration Colors:** Warm celebration tones (#FF7A39)
- **Warmth Colors:** Golden warmth (#F59E0B)
- **Depth Colors:** Refined neutrals (#64748B)

**Custom Utilities:**
- `shadow-soft`, `shadow-lifted`, `shadow-floating`
- Purposeful dark mode (designed, not auto-inverted)
- Responsive, mobile-first approach

---

## 🚀 Deployment

**Hosting:** Vercel (auto-deploy from GitHub)  
**Database:** Neon Postgres (serverless)  
**Cron Jobs:** Vercel Cron + QStash  
**Email:** Resend  
**SMS:** Twilio (A2P 10DLC)  

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

---

## 🤝 Contributing

This is a private project. Development follows Agile methodology with Epics → User Stories → Tasks.

See `docs/AGILE_IMPLEMENTATION_PLAN.md` for the implementation roadmap.

---

## 📄 License

Private - All rights reserved

---

## 🔗 Links

- **Live App:** TBD (deploying soon)
- **Documentation:** `/docs` folder
- **Issues:** GitHub Issues
- **Health Check:** http://localhost:3000/api/health

---

**Built with ❤️ using Next.js 16, React 19, and modern web technologies**
