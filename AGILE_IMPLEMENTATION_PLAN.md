# CircleDay - Agile Implementation Plan

## Overview

This plan organizes CircleDay development using Agile methodology:
- **Epics** - Large bodies of work (high-level features)
- **User Stories** - Specific user needs (user-facing value)
- **Tasks** - Technical work to complete stories (implementation details)

**Story Format:** "As a [role], I want [capability], so that [benefit]"

---

---

## Sprint 0: Pre-Development Setup

**Before starting Epic 1, complete these setup tasks:**

### Account Setup (2-3 hours)

| Service | Purpose | Setup Time | Monthly Cost |
|---------|---------|------------|--------------|
| Neon | Postgres database | 10 min | Free → $19/mo |
| Vercel | Hosting + deployment | 15 min | Free → $20/mo |
| Upstash | Redis + QStash | 20 min | Free → $10/mo |
| Resend | Email sending | 10 min | Free → $20/mo |
| Stripe | Payments (test mode) | 30 min | Free (2.9% + 30¢) |
| Sentry | Error tracking | 15 min | Free → $26/mo |
| Better Stack | Uptime monitoring | 10 min | Free → $20/mo |
| GitHub | Code repository | 5 min | Free |

**Action Items:**
- [ ] Create all accounts
- [ ] Enable 2FA on all accounts
- [ ] Document credentials in password manager
- [ ] Set up billing alerts

### Development Environment

**Required Tools:**
```bash
# Core
- Node.js 20+ LTS
- npm (or pnpm recommended)
- Git
- VS Code (or preferred IDE)

# VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- GitLens

# CLI Tools
- Vercel CLI: npm i -g vercel
- Stripe CLI: brew install stripe/stripe-cli/stripe
```

### Key Decisions

**Framework Versions:** ✅ Beta Stack (Next.js 16, React 19, Tailwind 4)
- Pin exact versions (no auto-updates)
- Create `stable-fallback` branch
- Monitor releases weekly

**Database Strategy:**
- ID Strategy: CUID (`@default(cuid())`)
- Soft Delete: Add `deletedAt` to User, Group, Contact, Event
- Timestamps: All models get `createdAt`, `updatedAt`

**Package Manager:** npm (or pnpm for faster installs)

**Estimated Setup Time:** 1 day (4-6 hours)

---

## Epic Prioritization

| Epic | Priority | Dependencies | Estimated Stories |
|------|----------|--------------|-------------------|
| **E1: Foundation & Infrastructure** | P0 (Critical) | Sprint 0 | 8 stories |
| **E2: Authentication & User Management** | P0 (Critical) | E1 | 6 stories |
| **E3: Group & Contact Management** | P0 (Critical) | E2 | 7 stories |
| **E4: Event Management** | P0 (Critical) | E3 | 5 stories |
| **E5: Reminder Scheduling System** | P0 (Critical) | E4 | 8 stories |
| **E6: Email Notifications** | P0 (Critical) | E5 | 4 stories |
| **E7: Multi-Channel Communications** | P1 (High) | E6 | 6 stories |
| **E8: Wish Wall & Engagement** | P1 (High) | E6 | 4 stories |
| **E9: Advanced Timezone & DST** | P1 (High) | E5 | 4 stories |
| **E10: Collaboration & Security** | P1 (High) | E3 | 8 stories |
| **E11: Payment & Gifting** | P2 (Medium) | E10 | 6 stories |
| **E12: Observability & Operations** | P0 (Critical) | E1 | 5 stories |
| **E13: Compliance & Privacy** | P1 (High) | E2 | 4 stories |

---

# Epic 1: Foundation & Infrastructure

**Goal:** Establish production-ready infrastructure and development environment

**Business Value:** Enables secure, scalable, maintainable application development

**Acceptance Criteria:**
- Application builds successfully
- Security headers configured
- Error handling in place
- Health checks operational
- All config documented

---

## US-1.1: Project Scaffolding

**As a** developer  
**I want** a properly configured Next.js 16 project with TypeScript  
**So that** I have a solid foundation to build features

**Acceptance Criteria:**
- [x] Next.js 16 beta installed and configured
- [x] TypeScript strict mode enabled
- [x] Development server runs without errors
- [x] Build process completes successfully
- [x] Hot reload works

**Story Points:** 3

### Tasks:
- [ ] **T-1.1.1** - Install Next.js 16 canary with React 19 RC
  - Run `npx create-next-app@canary`
  - Pin exact versions in package.json
  - Verify installation
  
- [ ] **T-1.1.2** - Configure TypeScript with strict mode
  - Create tsconfig.json with strict: true
  - Add path aliases (@/*)
  - Configure noUncheckedIndexedAccess
  
- [ ] **T-1.1.3** - Set up project directory structure
  - Create app/, components/, lib/, public/ directories
  - Set up nested app directory structure
  - Create initial layout.tsx and page.tsx
  
- [ ] **T-1.1.4** - Configure Next.js settings
  - Create next.config.ts
  - Enable reactStrictMode
  - Configure experimental features
  
- [ ] **T-1.1.5** - Verify build and dev server
  - Run `npm run build`
  - Run `npm run dev`
  - Test hot reload

**Files Created:**
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `app/layout.tsx`
- `app/page.tsx`

---

## US-1.2: Design System Setup

**As a** designer/developer  
**I want** Tailwind CSS 4 configured with CircleDay theme  
**So that** I can build beautiful, consistent UI components

**Acceptance Criteria:**
- [x] Tailwind CSS 4 alpha installed
- [x] Custom color palette configured
- [x] Typography system defined
- [x] Shadow utilities available
- [x] Dark mode support

**Story Points:** 5

### Tasks:
- [ ] **T-1.2.1** - Install and configure Tailwind CSS 4 alpha
  - Install tailwindcss@next
  - Create tailwind.config.ts
  - Create postcss.config.mjs
  
- [ ] **T-1.2.2** - Define CircleDay color palette
  - Add celebration colors (50-950 scale)
  - Add warmth colors
  - Add depth colors (neutrals)
  - Test color contrast
  
- [ ] **T-1.2.3** - Configure typography system
  - Set up font families (Geist Sans, Cal Sans)
  - Define font size scale
  - Configure line heights and letter spacing
  
- [ ] **T-1.2.4** - Add custom utilities
  - Define custom shadows (soft, lifted, floating)
  - Add animation utilities
  - Configure dark mode
  
- [ ] **T-1.2.5** - Create global styles
  - Set up app/globals.css
  - Add Tailwind directives
  - Define CSS variables
  
- [ ] **T-1.2.6** - Install shadcn/ui components
  - Run `npx shadcn-ui@latest init`
  - Configure components.json
  - Install initial components (button, card, etc.)

**Files Created:**
- `tailwind.config.ts`
- `postcss.config.mjs`
- `app/globals.css`
- `lib/theme/colors.ts`
- `lib/theme/typography.ts`
- `lib/theme/shadows.ts`
- `components/ui/` (shadcn components)

---

## US-1.3: Security Infrastructure

**As a** security-conscious developer  
**I want** security headers and CSP configured  
**So that** the application is protected from common attacks

**Acceptance Criteria:**
- [x] Security headers configured
- [x] CSP policy defined
- [x] HSTS enabled in production
- [x] XSS protection active
- [x] SecurityHeaders.com score A+

**Story Points:** 3

### Tasks:
- [ ] **T-1.3.1** - Create middleware.ts with security headers
  - Add X-Frame-Options: DENY
  - Add X-Content-Type-Options: nosniff
  - Add Referrer-Policy
  - Add Permissions-Policy
  
- [ ] **T-1.3.2** - Configure Content Security Policy
  - Define CSP directives
  - Allow necessary external sources (Stripe, etc.)
  - Test CSP in browser
  
- [ ] **T-1.3.3** - Add HSTS for production
  - Configure Strict-Transport-Security header
  - Set max-age to 1 year
  - Include subdomains
  
- [ ] **T-1.3.4** - Test security headers
  - Use securityheaders.com
  - Fix any issues
  - Document configuration

**Files Created:**
- `middleware.ts`

---

## US-1.4: Error Handling System

**As a** developer  
**I want** centralized error handling and logging  
**So that** I can quickly identify and fix issues

**Acceptance Criteria:**
- [x] Error types defined
- [x] Global error handler created
- [x] Sentry integrated
- [x] Error boundaries in place
- [x] User-friendly error pages

**Story Points:** 5

### Tasks:
- [ ] **T-1.4.1** - Define error types and codes
  - Create lib/errors/error-types.ts
  - Define ErrorCode enum
  - Document error codes
  
- [ ] **T-1.4.2** - Create AppError class and handler
  - Create lib/errors/error-handler.ts
  - Implement AppError class
  - Add handleError function
  
- [ ] **T-1.4.3** - Integrate Sentry
  - Install @sentry/nextjs
  - Create lib/errors/sentry-client.ts
  - Configure Sentry DSN
  - Add error tracking
  
- [ ] **T-1.4.4** - Create error boundary components
  - Create app/error.tsx
  - Create app/global-error.tsx
  - Add error recovery UI
  
- [ ] **T-1.4.5** - Test error handling
  - Trigger various error types
  - Verify Sentry captures errors
  - Check error boundaries work

**Files Created:**
- `lib/errors/error-types.ts`
- `lib/errors/error-handler.ts`
- `lib/errors/sentry-client.ts`
- `app/error.tsx`
- `app/global-error.tsx`

---

## US-1.5: Rate Limiting

**As a** developer  
**I want** rate limiting on all endpoints  
**So that** the application is protected from abuse

**Acceptance Criteria:**
- [x] Rate limiting configured per endpoint type
- [x] Upstash Rate Limit integrated
- [x] Rate limit headers returned
- [x] 429 errors handled gracefully
- [x] Different limits for auth/api/webhooks

**Story Points:** 3

### Tasks:
- [ ] **T-1.5.1** - Install and configure Upstash Rate Limit
  - Install @upstash/ratelimit
  - Set up Redis connection
  - Test connection
  
- [ ] **T-1.5.2** - Define rate limit configuration
  - Create lib/rate-limit/config.ts
  - Define limits for auth endpoints
  - Define limits for API endpoints
  - Define limits for webhooks
  
- [ ] **T-1.5.3** - Create rate limiting utilities
  - Create lib/rate-limit/upstash.ts
  - Implement rate limit wrapper
  - Add rate limit headers
  
- [ ] **T-1.5.4** - Apply rate limiting to endpoints
  - Add to auth routes
  - Add to API routes
  - Handle 429 responses
  
- [ ] **T-1.5.5** - Test rate limiting
  - Test with siege or ab
  - Verify limits enforced
  - Check headers returned

**Files Created:**
- `lib/rate-limit/config.ts`
- `lib/rate-limit/upstash.ts`

---

## US-1.6: Environment Configuration

**As a** developer  
**I want** all environment variables documented and validated  
**So that** I know exactly what configuration is needed

**Acceptance Criteria:**
- [x] .env.example complete with all variables
- [x] Environment variables validated at startup
- [x] Clear documentation for each variable
- [x] Development defaults provided
- [x] Production checklist available

**Story Points:** 2

### Tasks:
- [ ] **T-1.6.1** - Create comprehensive .env.example
  - List all required variables
  - Add descriptions for each
  - Group by service
  - Include example values
  
- [ ] **T-1.6.2** - Create environment validation
  - Create lib/env.ts
  - Use Zod to validate env vars
  - Fail fast on missing required vars
  
- [ ] **T-1.6.3** - Document environment setup
  - Create docs/ENVIRONMENT.md
  - Document each variable
  - Add setup instructions
  
- [ ] **T-1.6.4** - Create .env.local for development
  - Copy from .env.example
  - Add development defaults
  - Test application starts

**Files Created:**
- `.env.example`
- `lib/env.ts`
- `docs/ENVIRONMENT.md`

---

## US-1.7: Health Checks & Monitoring

**As a** DevOps engineer  
**I want** health check endpoints  
**So that** I can monitor application status

**Acceptance Criteria:**
- [x] /api/health endpoint responds
- [x] Database health checked
- [x] Queue health checked
- [x] Response includes timestamp and version
- [x] Returns 503 if unhealthy

**Story Points:** 2

### Tasks:
- [ ] **T-1.7.1** - Create health check endpoint
  - Create app/api/health/route.ts
  - Return basic health status
  - Include timestamp
  
- [ ] **T-1.7.2** - Add database health check
  - Ping database connection
  - Check query execution
  - Return db status
  
- [ ] **T-1.7.3** - Add queue health check
  - Check QStash connection
  - Verify queue accessible
  - Return queue status
  
- [ ] **T-1.7.4** - Test health endpoint
  - Curl endpoint
  - Verify response format
  - Test unhealthy scenarios

**Files Created:**
- `app/api/health/route.ts`

---

## US-1.8: Testing Infrastructure

**As a** developer  
**I want** testing framework configured  
**So that** I can write and run tests from day one

**Acceptance Criteria:**
- [x] Vitest configured
- [x] React Testing Library installed
- [x] Playwright set up
- [x] MSW configured for API mocking
- [x] CI/CD running tests

**Story Points:** 5

### Tasks:
- [ ] **T-1.8.1** - Install and configure Vitest
  - Install vitest and dependencies
  - Create vitest.config.ts
  - Create vitest.setup.ts
  - Add test scripts to package.json
  
- [ ] **T-1.8.2** - Set up React Testing Library
  - Install @testing-library/react
  - Install @testing-library/user-event
  - Install @testing-library/jest-dom
  - Configure test utilities
  
- [ ] **T-1.8.3** - Configure Playwright
  - Install @playwright/test
  - Create playwright.config.ts
  - Set up browser configs
  - Add E2E test scripts
  
- [ ] **T-1.8.4** - Set up MSW for API mocking
  - Install msw
  - Create __tests__/mocks/server.ts
  - Create __tests__/mocks/handlers.ts
  - Configure in vitest.setup.ts
  
- [ ] **T-1.8.5** - Create test directory structure
  - Create __tests__/unit/
  - Create __tests__/integration/
  - Create e2e/
  - Add example tests
  
- [ ] **T-1.8.6** - Set up GitHub Actions
  - Create .github/workflows/test.yml
  - Run unit tests on push
  - Run E2E tests on PR
  - Upload coverage

**Files Created:**
- `vitest.config.ts`
- `vitest.setup.ts`
- `playwright.config.ts`
- `__tests__/mocks/server.ts`
- `__tests__/mocks/handlers.ts`
- `.github/workflows/test.yml`

---

# Epic 2: Authentication & User Management

**Goal:** Enable users to securely sign up, log in, and manage their accounts

**Business Value:** Users can access the platform and protect their data

**Dependencies:** Epic 1

---

## US-2.1: Magic Link Authentication

**As a** user  
**I want** to log in with a magic link sent to my email  
**So that** I don't have to remember a password

**Acceptance Criteria:**
- [x] User can request magic link
- [x] Email sent within 30 seconds
- [x] Link expires after 15 minutes
- [x] One-time use only
- [x] Session created on successful login

**Story Points:** 8

### Tasks:
- [ ] **T-2.1.1** - Set up Better Auth
  - Install better-auth
  - Create lib/auth/config.ts
  - Configure database adapter
  - Set up session management
  
- [ ] **T-2.1.2** - Configure magic link provider
  - Add email provider to Better Auth
  - Set link expiration (15 min)
  - Configure Resend integration
  
- [ ] **T-2.1.3** - Create API route handler
  - Create app/api/auth/[...all]/route.ts
  - Handle Better Auth requests
  - Add error handling
  
- [ ] **T-2.1.4** - Create login page
  - Create app/(auth)/login/page.tsx
  - Add email input form
  - Use Conform for validation
  - Show loading state
  
- [ ] **T-2.1.5** - Create magic link email template
  - Create lib/email/templates/magic-link.tsx
  - Use React Email
  - Add CircleDay branding
  - Include expiration notice
  
- [ ] **T-2.1.6** - Create verification page
  - Create app/(auth)/verify/page.tsx
  - Handle token verification
  - Redirect on success
  - Show error on failure
  
- [ ] **T-2.1.7** - Implement rate limiting
  - Limit to 3 requests per 15 min
  - By email address
  - Show friendly error
  
- [ ] **T-2.1.8** - Write tests
  - Unit test auth config
  - Integration test login flow
  - E2E test magic link flow

**Files Created:**
- `lib/auth/config.ts`
- `lib/auth/actions.ts`
- `app/api/auth/[...all]/route.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/verify/page.tsx`
- `lib/email/templates/magic-link.tsx`
- `components/auth/magic-link-form.tsx`

---

## US-2.2: Session Management

**As a** user  
**I want** my session to persist securely  
**So that** I don't have to log in repeatedly

**Acceptance Criteria:**
- [x] Session persists for 30 days (idle timeout)
- [x] Absolute timeout after 180 days
- [x] Session invalidated on logout
- [x] Secure httpOnly cookies used
- [x] Session data includes user info

**Story Points:** 3

### Tasks:
- [ ] **T-2.2.1** - Configure session settings in Better Auth
  - Set idle timeout (30 days)
  - Set absolute timeout (180 days)
  - Configure cookie settings
  
- [ ] **T-2.2.2** - Create session utilities
  - Create lib/auth/session.ts
  - Add getCurrentUser helper
  - Add requireAuth helper
  
- [ ] **T-2.2.3** - Implement logout
  - Create logout server action
  - Invalidate session
  - Clear cookies
  - Redirect to login
  
- [ ] **T-2.2.4** - Test session persistence
  - Verify session persists across refreshes
  - Test timeout behaviors
  - Test logout

**Files Created:**
- `lib/auth/session.ts`
- `lib/actions/auth.ts`

---

## US-2.3: User Profile Management

**As a** user  
**I want** to view and edit my profile  
**So that** I can keep my information up to date

**Acceptance Criteria:**
- [x] User can view profile
- [x] User can edit name
- [x] User can edit default timezone
- [x] Email shown but not editable (requires step-up)
- [x] Changes saved successfully

**Story Points:** 5

### Tasks:
- [ ] **T-2.3.1** - Create user profile database schema
  - Add User model to Prisma
  - Include name, email, phone, timezone fields
  - Add timestamps
  - Run migration
  
- [ ] **T-2.3.2** - Create profile page
  - Create app/(dashboard)/account/page.tsx
  - Show current user data
  - Add edit form
  
- [ ] **T-2.3.3** - Create update profile server action
  - Create updateProfile in lib/actions/user.ts
  - Validate input with Zod
  - Update database
  - Return success/error
  
- [ ] **T-2.3.4** - Add timezone selector
  - Create components/timezone-select.tsx
  - Use IANA timezone list
  - Group by region
  
- [ ] **T-2.3.5** - Write tests
  - Unit test updateProfile action
  - Integration test profile update
  - E2E test profile edit flow

**Files Created:**
- `prisma/schema.prisma` (User model)
- `app/(dashboard)/account/page.tsx`
- `lib/actions/user.ts`
- `components/timezone-select.tsx`

---

## US-2.4: Device Management

**As a** user  
**I want** to see all my active sessions  
**So that** I can revoke access from devices I no longer use

**Acceptance Criteria:**
- [x] List all active sessions
- [x] Show device info (browser, OS)
- [x] Show last activity time
- [x] Can revoke individual sessions
- [x] Can revoke all other sessions

**Story Points:** 5

### Tasks:
- [ ] **T-2.4.1** - Extend session model
  - Add user agent tracking
  - Add last activity timestamp
  - Add IP address (optional)
  
- [ ] **T-2.4.2** - Create sessions page
  - Create app/(dashboard)/account/sessions/page.tsx
  - List all user sessions
  - Show current session indicator
  
- [ ] **T-2.4.3** - Create session list component
  - Create components/account/session-list.tsx
  - Parse user agent
  - Show device icons
  - Format timestamps
  
- [ ] **T-2.4.4** - Implement revoke actions
  - Create revokeSession in lib/actions/sessions.ts
  - Create revokeAllOtherSessions action
  - Confirm before revoking
  
- [ ] **T-2.4.5** - Write tests
  - Test session listing
  - Test session revocation
  - E2E test device management

**Files Created:**
- `app/(dashboard)/account/sessions/page.tsx`
- `components/account/session-list.tsx`
- `lib/actions/sessions.ts`

---

## US-2.5: Step-Up Authentication

**As a** user  
**I want** to verify my identity for sensitive actions  
**So that** my account stays secure

**Acceptance Criteria:**
- [x] OTP required for sensitive actions
- [x] OTP sent to verified email or phone
- [x] 6-digit code
- [x] 10-minute expiration
- [x] 3 max attempts

**Story Points:** 8

### Tasks:
- [ ] **T-2.5.1** - Create verification code model
  - Add VerificationCode to Prisma schema
  - Include code, type, expiresAt, attempts
  - Add indexes
  
- [ ] **T-2.5.2** - Create OTP generation
  - Create lib/auth/step-up.ts
  - Generate 6-digit code
  - Hash and store in database
  - Set 10-min expiration
  
- [ ] **T-2.5.3** - Create OTP sending
  - Send via email (Resend)
  - Send via SMS (Twilio) - Phase 2
  - Use template
  
- [ ] **T-2.5.4** - Create OTP verification
  - Verify code matches
  - Check expiration
  - Track attempts
  - Lock after 3 failures
  
- [ ] **T-2.5.5** - Create step-up dialog
  - Create components/auth/step-up-dialog.tsx
  - OTP input field
  - Resend option
  - Error handling
  
- [ ] **T-2.5.6** - Integrate with sensitive actions
  - Require for email change
  - Require for delete account
  - Require for data export
  
- [ ] **T-2.5.7** - Write tests
  - Test OTP generation
  - Test verification
  - Test attempt limiting

**Files Created:**
- `lib/auth/step-up.ts`
- `components/auth/step-up-dialog.tsx`
- `lib/email/templates/otp.tsx`

---

## US-2.6: Account Deletion

**As a** user  
**I want** to delete my account  
**So that** my data is removed if I no longer use the service

**Acceptance Criteria:**
- [x] Step-up auth required
- [x] Confirmation required
- [x] Soft delete (90-day retention)
- [x] User notified via email
- [x] All data marked for deletion

**Story Points:** 5

### Tasks:
- [ ] **T-2.6.1** - Add soft delete to User model
  - Add deletedAt field
  - Add deletion reason
  - Update indexes
  
- [ ] **T-2.6.2** - Create delete account page
  - Create app/(dashboard)/account/delete/page.tsx
  - Show warning
  - Require confirmation
  - Trigger step-up auth
  
- [ ] **T-2.6.3** - Implement deletion logic
  - Create deleteAccount in lib/actions/user.ts
  - Soft delete user
  - Mark associated data
  - Invalidate sessions
  
- [ ] **T-2.6.4** - Send confirmation email
  - Create deletion confirmation template
  - Include recovery period
  - Add recovery link (Phase 2)
  
- [ ] **T-2.6.5** - Create cleanup job
  - Purge after 90 days
  - Delete PII
  - Keep anonymized analytics
  
- [ ] **T-2.6.6** - Write tests
  - Test deletion flow
  - Test data cleanup
  - E2E test account deletion

**Files Created:**
- `app/(dashboard)/account/delete/page.tsx`
- `lib/email/templates/account-deleted.tsx`

---

# Epic 3: Group & Contact Management

**Goal:** Enable users to organize contacts into groups for reminder management

**Business Value:** Core feature for managing multiple celebration circles

**Dependencies:** Epic 2

---

## US-3.1: Create Group

**As a** user  
**I want** to create a group for my family or friends  
**So that** I can organize related contacts together

**Acceptance Criteria:**
- [x] User can create group with name
- [x] Group has default timezone
- [x] User becomes owner automatically
- [x] Group created in database
- [x] User redirected to group dashboard

**Story Points:** 5

### Tasks:
- [ ] **T-3.1.1** - Create Group and Membership models
  - Add Group model to Prisma
  - Add Membership model
  - Define relationships
  - Add indexes
  - Run migration
  
- [ ] **T-3.1.2** - Create groups list page
  - Create app/(dashboard)/groups/page.tsx
  - Show user's groups
  - Add "Create Group" button
  - Show empty state
  
- [ ] **T-3.1.3** - Create group creation dialog
  - Create components/groups/create-group-dialog.tsx
  - Form with name and timezone
  - Use Conform + Zod
  - Handle submission
  
- [ ] **T-3.1.4** - Create server action
  - Create createGroup in lib/actions/groups.ts
  - Use database transaction
  - Create group + initial membership
  - Log to audit trail
  
- [ ] **T-3.1.5** - Write tests
  - Unit test createGroup action
  - Test validation
  - Test transaction
  - E2E test group creation

**Files Created:**
- `prisma/schema.prisma` (Group, Membership models)
- `app/(dashboard)/groups/page.tsx`
- `components/groups/create-group-dialog.tsx`
- `lib/actions/groups.ts`

---

## US-3.2: View Group Dashboard

**As a** group owner  
**I want** to see an overview of my group  
**So that** I can quickly see members, upcoming events, and activity

**Acceptance Criteria:**
- [x] Dashboard shows group name
- [x] Shows member count
- [x] Shows upcoming events (next 5)
- [x] Shows recent activity
- [x] Beautiful, organized layout

**Story Points:** 5

### Tasks:
- [ ] **T-3.2.1** - Create group dashboard page
  - Create app/(dashboard)/groups/[id]/page.tsx
  - Fetch group data
  - Check user permissions
  - Show loading state
  
- [ ] **T-3.2.2** - Create dashboard stats component
  - Create components/groups/group-stats.tsx
  - Show member count
  - Show event count
  - Show last activity
  
- [ ] **T-3.2.3** - Create upcoming events component
  - Create components/dashboard/upcoming-events.tsx
  - Show next 5 events
  - Link to full calendar
  - Beautiful card design
  
- [ ] **T-3.2.4** - Create recent activity feed
  - Create components/dashboard/activity-feed.tsx
  - Show last 10 activities
  - Format timestamps
  - Group by date
  
- [ ] **T-3.2.5** - Write tests
  - Test dashboard data fetching
  - Test permissions
  - E2E test dashboard view

**Files Created:**
- `app/(dashboard)/groups/[id]/page.tsx`
- `components/groups/group-stats.tsx`
- `components/dashboard/upcoming-events.tsx`
- `components/dashboard/activity-feed.tsx`

---

## US-3.3: Manage Members

**As a** group owner  
**I want** to add, edit, and remove members  
**So that** I can keep my group up to date

**Acceptance Criteria:**
- [x] Can add member with name, email/phone
- [x] Can edit member details
- [x] Can remove member
- [x] Can assign roles (owner, admin, member)
- [x] Changes logged in audit trail

**Story Points:** 8

### Tasks:
- [ ] **T-3.3.1** - Create Contact model
  - Add Contact to Prisma schema
  - Include name, email, phone, timezone
  - Add photoUrl (Phase 3)
  - Add indexes
  
- [ ] **T-3.3.2** - Create members list page
  - Create app/(dashboard)/groups/[id]/members/page.tsx
  - Show all members
  - Add search/filter
  - Add "Add Member" button
  
- [ ] **T-3.3.3** - Create add member form
  - Create components/members/add-member-form.tsx
  - Fields: name, email, phone, timezone
  - Validation with Zod
  - Handle submission
  
- [ ] **T-3.3.4** - Create member server actions
  - Create addMember in lib/actions/members.ts
  - Create updateMember
  - Create removeMember
  - Use transactions
  - Log to audit
  
- [ ] **T-3.3.5** - Create member card component
  - Create components/members/member-card.tsx
  - Show member info
  - Edit/delete buttons
  - Role badge
  
- [ ] **T-3.3.6** - Implement role management
  - Define roles (OWNER, ADMIN, MEMBER, VIEWER)
  - Check permissions
  - Prevent owner removal
  
- [ ] **T-3.3.7** - Write tests
  - Test CRUD operations
  - Test permissions
  - E2E test member management

**Files Created:**
- `app/(dashboard)/groups/[id]/members/page.tsx`
- `components/members/add-member-form.tsx`
- `components/members/member-card.tsx`
- `lib/actions/members.ts`

---

## US-3.4: Bulk Import Members

**As a** group owner  
**I want** to import multiple members at once  
**So that** I can quickly set up a large group

**Acceptance Criteria:**
- [x] Can paste text with multiple members
- [x] Can upload CSV file
- [x] Preview before import
- [x] Shows validation errors
- [x] Imports valid rows only

**Story Points:** 5

### Tasks:
- [ ] **T-3.4.1** - Create bulk import dialog (paste)
  - Create components/members/bulk-import-dialog.tsx
  - Text area for paste
  - Parse format (name, email/phone per line)
  - Validate each row
  
- [ ] **T-3.4.2** - Add CSV upload (Phase 3)
  - File input
  - Use PapaParse to parse CSV
  - Map columns
  - Validate
  
- [ ] **T-3.4.3** - Create preview component
  - Show parsed data in table
  - Highlight errors
  - Allow row removal
  - Confirm import
  
- [ ] **T-3.4.4** - Create bulk import action
  - Create bulkAddMembers in lib/actions/members.ts
  - Validate all rows
  - Use transaction
  - Return success/error counts
  
- [ ] **T-3.4.5** - Write tests
  - Test paste parsing
  - Test CSV parsing
  - Test validation
  - Test bulk import

**Files Created:**
- `components/members/bulk-import-dialog.tsx`
- `lib/import/csv-parser.ts` (Phase 3)

---

## US-3.5: Group Settings

**As a** group owner  
**I want** to configure group settings  
**So that** I can customize how the group works

**Acceptance Criteria:**
- [x] Can edit group name
- [x] Can set default timezone
- [x] Can configure quiet hours (Phase 2)
- [x] Can set leap day policy (Phase 2)
- [x] Settings saved successfully

**Story Points:** 3

### Tasks:
- [ ] **T-3.5.1** - Create settings page
  - Create app/(dashboard)/groups/[id]/settings/page.tsx
  - Show current settings
  - Add edit form
  
- [ ] **T-3.5.2** - Create settings form
  - Create components/groups/settings-form.tsx
  - Name input
  - Timezone selector
  - Quiet hours (Phase 2)
  - Leap day policy (Phase 2)
  
- [ ] **T-3.5.3** - Create update settings action
  - Create updateGroupSettings in lib/actions/groups.ts
  - Validate input
  - Update database
  - Invalidate cache
  
- [ ] **T-3.5.4** - Write tests
  - Test settings update
  - Test validation
  - E2E test settings page

**Files Created:**
- `app/(dashboard)/groups/[id]/settings/page.tsx`
- `components/groups/settings-form.tsx`

---

(Continuing with remaining epics...)

---

# Summary

This reorganization provides:

✅ **Epic-level planning** - Large features grouped logically  
✅ **User Stories** - Clear user value for each feature  
✅ **Granular Tasks** - Specific implementation steps  
✅ **Story Points** - Effort estimation  
✅ **Dependencies** - Clear order of work  
✅ **Acceptance Criteria** - Definition of done  
✅ **Files to Create** - Concrete deliverables  

**Next Steps:**
1. Review Epic 1 & 2 structure
2. Continue with remaining Epics 4-13
3. Create GitHub Projects board
4. Start with Epic 1, Story US-1.1

**Estimated Total:** 100+ User Stories, 400+ Tasks

---

## Related Documentation

For comprehensive technical details, see:
- **PLAN.md** - Full technical plan with architecture, testing strategy, infrastructure details, file structure, design system, and production readiness review

---

## Getting Started

1. **Complete Sprint 0** - Set up accounts and development environment
2. **Start Epic 1** - Begin with US-1.1 (Project Scaffolding)
3. **Track Progress** - Use GitHub Projects or similar tool
4. **Follow Story Order** - Complete acceptance criteria before moving to next story
5. **Write Tests** - As you implement each story
6. **Review PLAN.md** - For technical implementation details

---

**Status:** Ready to implement  
**Next Action:** Complete Sprint 0 setup  
**First Story:** US-1.1 Project Scaffolding

