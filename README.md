# CircleDay

Never miss a celebration 🎉

## Documentation

This project has two main planning documents:

### 1. **AGILE_IMPLEMENTATION_PLAN.md** 📋 (Start Here!)
Your working implementation guide organized by:
- **Epics** - Large bodies of work
- **User Stories** - Specific user needs
- **Tasks** - Technical implementation steps

**Use this for:** Day-to-day development, sprint planning, tracking progress

**Start with:** Sprint 0 → Epic 1 → User Story 1.1

---

### 2. **PLAN.md** 📚 (Technical Reference)
Comprehensive technical documentation including:
- Complete tech stack details
- Testing strategy (Vitest, RTL, Playwright)
- Database schema with indexes
- Infrastructure & security setup
- Rate limiting configuration
- Webhook security
- Caching strategy
- File structure
- Design system
- Production readiness checklist

**Use this for:** Technical details, architecture decisions, configuration examples

---

## Quick Start

### 1. Complete Sprint 0 (1 day)
```bash
# Set up accounts (Neon, Vercel, Upstash, Resend, Stripe, Sentry, GitHub)
# Install development tools (Node.js 20+, Git, VS Code)
# Make key decisions (documented in Sprint 0)
```

### 2. Start Epic 1 - Foundation
```bash
# First story: US-1.1 Project Scaffolding
# Follow tasks in AGILE_IMPLEMENTATION_PLAN.md
```

### 3. Track Progress
- Use GitHub Projects or similar
- Check off tasks as you complete them
- Follow story order (dependencies matter)

---

## Tech Stack

**Framework:** Next.js 16 beta, React 19 RC, TypeScript 5.6+  
**Database:** Neon Postgres + Prisma 6  
**Auth:** Better Auth 1.0  
**Queue:** Upstash QStash  
**Cache:** Upstash Redis  
**UI:** shadcn/ui + Radix + Tailwind CSS 4 beta  
**Email:** Resend  
**Payments:** Stripe  
**Testing:** Vitest + React Testing Library + Playwright  

---

## Development Approach

**Methodology:** Agile with Epics → User Stories → Tasks

**Story Format:** "As a [role], I want [capability], so that [benefit]"

**Story Points:** Fibonacci scale (1, 2, 3, 5, 8, 13)

**Definition of Done:**
- All acceptance criteria met
- Tests written and passing
- Code reviewed
- Documentation updated

---

## Project Status

**Phase:** Planning Complete ✅  
**Next Action:** Sprint 0 setup  
**Estimated Timeline:** 10-14 weeks (100+ stories)

---

## Contributing

1. Read AGILE_IMPLEMENTATION_PLAN.md for current sprint
2. Pick a user story
3. Complete all tasks in the story
4. Ensure tests pass
5. Submit for review

---

## License

Private - All rights reserved

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Ready for implementation

