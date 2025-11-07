# Documentation Index

Quick reference for all CircleDay documentation.

## 🚀 Getting Started

| Document | Purpose | Time |
|----------|---------|------|
| [README.md](README.md) | Project overview and quick start | 5 min |
| [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md) | Production deployment guide | 30 min |

## 📦 Deployment

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide |
| [TEMPORAL_API_KEY_SETUP.md](TEMPORAL_API_KEY_SETUP.md) | Temporal Cloud authentication |
| [VPS_SETUP_CHECKLIST.md](VPS_SETUP_CHECKLIST.md) | VPS worker configuration |
| [.github/workflows/README.md](.github/workflows/README.md) | CI/CD documentation |

## 🎯 Features

| Document | Purpose |
|----------|---------|
| [GROUP_TYPES_IMPLEMENTATION.md](GROUP_TYPES_IMPLEMENTATION.md) | PERSONAL vs TEAM groups |
| [docs/EVENT_INVITE_FEATURE.md](docs/EVENT_INVITE_FEATURE.md) | Public event submission |

## 🔧 Technical

| Document | Purpose |
|----------|---------|
| [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Testing strategy |
| [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md) | Email configuration |
| [docs/RATE_LIMITING.md](docs/RATE_LIMITING.md) | Rate limiting setup |
| [docs/NEXTJS_16_CACHE_OPTIMIZATION.md](docs/NEXTJS_16_CACHE_OPTIMIZATION.md) | Performance optimization |

## 📊 Database

| Resource | Purpose |
|----------|---------|
| [prisma/schema.prisma](prisma/schema.prisma) | Database schema |
| [prisma/seeds/README.md](prisma/seeds/README.md) | Demo data guide |
| `npx prisma studio` | Database GUI |

## 🧪 Testing

| Resource | Purpose |
|----------|---------|
| [__tests__/](/__tests__/) | Unit tests |
| [e2e/](e2e/) | E2E tests |
| [__tests__/temporal/workflows.test.ts](__tests__/temporal/workflows.test.ts) | Workflow tests |

---

## 📖 Reading Order

### For New Developers

1. [README.md](README.md) - Project overview
2. [docs/README.md](docs/README.md) - Technical docs index
3. [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - How to run tests

### For Deployment

1. [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md) - Overview
2. [TEMPORAL_API_KEY_SETUP.md](TEMPORAL_API_KEY_SETUP.md) - Temporal auth
3. [VPS_SETUP_CHECKLIST.md](VPS_SETUP_CHECKLIST.md) - Worker setup
4. [DEPLOYMENT.md](DEPLOYMENT.md) - Complete reference

### For Feature Development

1. [GROUP_TYPES_IMPLEMENTATION.md](GROUP_TYPES_IMPLEMENTATION.md) - Example feature
2. [docs/EVENT_INVITE_FEATURE.md](docs/EVENT_INVITE_FEATURE.md) - Another example
3. [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - How to test

---

## 🗑️ Recently Removed

Cleaned up on 2024-11-07:
- `DEPLOYMENT_OPTIONS.md` - Redundant
- `DEV_SETUP.md` - Merged into README
- `IMPLEMENTATION_COMPLETE.md` - Development artifact
- `REFACTOR_COMPLETE.md` - Development artifact
- `REFACTOR_PROGRESS.md` - Development artifact
- `SETUP_GITHUB_REGISTRY.md` - Merged into DEPLOYMENT.md
- `TEMPORAL_MIGRATION.md` - Not needed for new deploys
- `TEMPORAL_PRODUCTION.md` - Consolidated
- `TEMPORAL_REFACTOR_PLAN.md` - Development artifact
- `TEST_REMINDER_GUIDE.md` - Merged into README
- `VPS_PROVIDER_AGNOSTIC.md` - Merged into VPS_SETUP_CHECKLIST.md
- `docs/REMINDER_SCHEDULING.md` - Outdated (now using Temporal)

---

**Last Updated**: November 7, 2024

