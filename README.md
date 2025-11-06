# CircleDay

**Never miss a celebration** 🎉

CircleDay is a celebration management platform that helps you remember and celebrate important dates with the people you care about.

---

## 🎯 What is CircleDay?

CircleDay makes it effortless to:
- **Remember** birthdays, anniversaries, and special occasions
- **Send** timely reminders via email and SMS
- **Collaborate** with groups to celebrate together
- **Track** events with flexible group types (PERSONAL or TEAM)

### Current Features

- 🎂 Event management (birthdays, anniversaries, custom events)
- 👥 Group organization with member management
- 🏷️ **Group Types:** PERSONAL (one organizer) or TEAM (mutual reminders)
- ⏰ Timezone-aware reminder scheduling
- 📧 Email notifications with beautiful templates
- 📱 SMS notifications via Twilio
- 🔒 Secure authentication (magic links)
- 📊 Reminder history and audit logs
- 🔗 Shareable event invite links

---

## 🛠️ Tech Stack

**Framework:** Next.js 16.0.1 + React 19 + TypeScript 5.6  
**Database:** Neon Postgres + Prisma 6  
**Auth:** Better Auth 1.0  
**UI:** Tailwind CSS 4 + shadcn/ui + Framer Motion  
**Infrastructure:** Upstash (Redis + QStash), Resend (Email), Twilio (SMS)  
**Testing:** Vitest (133 unit tests) + Playwright (26 E2E tests)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- npm 10+
- PostgreSQL database (Neon recommended)
- Upstash account (Redis + QStash)
- Resend account (emails)

### Installation

```bash
# Clone and install
git clone https://github.com/[username]/circleday.git
cd circleday
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your credentials

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

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
RESEND_FROM_EMAIL="CircleDay <hello@yourdomain.com>"

# SMS (optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-number"

# Auth (generate 32+ char secret)
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📦 Key Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run unit tests (133 tests)
npm run test:ui          # Interactive test UI
npm run test:e2e         # E2E tests (26 tests)
npm run type-check       # TypeScript check
npm run lint             # ESLint

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma client

# Seeding
npx tsx prisma/seeds/group-types-demo.ts  # Load demo data
```

**Test Status:** ✅ 133 unit + 26 E2E = 159 tests passing

---

## 📁 Project Structure

```
circleday/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth pages
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── groups/          # Group management
│   │   ├── events/          # Event management
│   │   └── profile/         # User profile
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard components
│   └── events/              # Event components
├── lib/
│   ├── actions/             # Server Actions
│   ├── services/            # Business logic
│   │   ├── reminder-scheduler.ts
│   │   └── reminder-sender.ts
│   ├── db/                  # Prisma client
│   └── auth/                # Auth config
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Migration history
│   └── seeds/               # Demo data
├── __tests__/               # Unit tests
└── e2e/                     # E2E tests
```

---

## 🎯 Group Types Feature

CircleDay supports two group types for flexible reminder distribution:

### 👤 PERSONAL Groups
**Use case:** One person manages celebrations for others  
**Behavior:** Only the group owner receives all reminders  
**Example:** Manager tracking team birthdays

### 👥 TEAM Groups
**Use case:** Groups where everyone participates  
**Behavior:** All members receive reminders EXCEPT the person being celebrated  
**Example:** Family reminding each other of birthdays

**Documentation:** See `GROUP_TYPES_IMPLEMENTATION.md`  
**Demo Data:** Run `npx tsx prisma/seeds/group-types-demo.ts`

---

## 🧪 Testing

```bash
# Unit tests (133 tests)
npm test

# E2E tests (26 tests)
npm run test:e2e

# Run all tests
npm run test:all

# Type checking
npm run type-check
```

**Coverage Areas:**
- ✅ Server Actions (groups, events, reminders, profile)
- ✅ Business Logic (scheduler, sender, calculator)
- ✅ UI Components
- ✅ Database Integration
- ✅ User Flows (E2E)

---

## 📚 Documentation

- **`GROUP_TYPES_IMPLEMENTATION.md`** - Group types feature guide
- **`prisma/seeds/README.md`** - Demo data guide
- **`docs/TESTING_GUIDE.md`** - Testing setup and guide
- **`docs/EVENT_INVITE_FEATURE.md`** - Event invite links
- **`docs/REMINDER_SCHEDULING.md`** - Reminder system architecture
- **`docs/EMAIL_SETUP.md`** - Email configuration
- **`docs/RATE_LIMITING.md`** - Rate limiting setup
- **`docs/NEXTJS_16_CACHE_OPTIMIZATION.md`** - Performance optimization

---

## 🗄️ Database

**21 Models** organized across authentication, groups, events, and reminders

**Core Models:**
- User, Session, Account (authentication)
- Group, Membership, Contact (organization)
- Event, ReminderRule, ScheduledSend, SendLog (reminders)
- EventInviteToken, AuditLog, Suppression (tracking)

**Features:**
- 20+ strategic indexes
- Soft delete support
- Full audit trail
- Type-safe enums

---

## 🔒 Security

- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on all endpoints
- Centralized error handling
- Magic link authentication
- Audit trail for all changes
- Zod validation for all inputs
- SQL injection protection (Prisma)

---

## 🚀 Deployment

**Recommended:** Vercel + Neon

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

**Production Checklist:**
- [ ] Set all environment variables
- [ ] Configure production database (Neon)
- [ ] Set up cron jobs for reminders
- [ ] Configure domain and CORS
- [ ] Enable error tracking (Sentry)
- [ ] Set up uptime monitoring

---

## 📊 Current Status

**Phase:** Core features complete, enhancing functionality  
**Tests:** 159 passing (133 unit + 26 E2E)  
**Build:** ✅ Successful  
**TypeScript:** ✅ No errors

**Recent Additions:**
- ✅ Group types (PERSONAL / TEAM)
- ✅ Event invite links
- ✅ Reminder history dashboard
- ✅ SMS notifications
- ✅ Comprehensive test coverage

---

## 🎨 Design System

**CircleDay Custom Theme:**
- Celebration colors (warm orange)
- Golden warmth accents
- Refined neutral tones
- Purposeful dark mode
- Custom shadows (soft, lifted, floating)
- Mobile-first responsive design

---

## 🤝 Contributing

This is a private project following modern development practices.

**Standards:**
- TypeScript strict mode
- Comprehensive testing
- Server Actions over API routes
- Component composition
- Semantic HTML
- Accessibility first

---

## 📄 License

Private - All rights reserved

---

## 🔗 Quick Links

- **Health Check:** http://localhost:3000/api/health
- **Database GUI:** `npx prisma studio`
- **Test UI:** `npm run test:ui`
- **Documentation:** `/docs` folder

---

**Built with ❤️ using Next.js 16, React 19, and modern web technologies**
