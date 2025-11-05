# 🧪 Testing Guide for CircleDay

## Test Suite Overview

CircleDay has a comprehensive testing strategy with different levels of tests:

### **1. Unit Tests** (127 tests)
- **Location**: `__tests__/`
- **Run with**: `npm test`
- **Purpose**: Test individual functions and components in isolation
- **No dependencies**: Don't require database or external services
- **Fast**: Run in ~4 seconds

### **2. E2E Tests** (44 tests)
- **Location**: `e2e/`
- **Run with**: `npm run test:e2e`
- **Purpose**: Test user flows and UI functionality
- **Two types**: UI smoke tests (CI) and full integration tests (local)

---

## Running Tests

### **Quick Test (Unit Only)**
```bash
npm test
```
- Runs all unit tests
- Fast and reliable
- No setup required

### **E2E Tests in CI Mode (Smoke Tests)**
```bash
npm run test:e2e
```
- Tests UI components and routes
- Does not require DATABASE_URL
- Safe for CI/CD pipelines
- Skips database-dependent tests

### **E2E Tests with Full Integration (Local)**
```bash
# 1. Ensure your .env has DATABASE_URL set
# 2. Run all E2E tests (including integration)
npm run test:e2e:local
```
- Requires DATABASE_URL in environment
- Tests full user flows with database
- Creates and cleans up test data
- Best for local development

### **Run Specific Test File**
```bash
# Unit test
npm test -- groups.test.ts

# E2E test
npm run test:e2e -- groups.spec.ts
```

### **Watch Mode (Development)**
```bash
# Unit tests
npm test -- --watch

# E2E tests with UI
npm run test:e2e -- --ui
```

---

## Test Structure

### **Unit Tests Example**
```typescript
// __tests__/lib/utils/token-generator.test.ts
import { describe, it, expect } from 'vitest'
import { generateSecureToken } from '@/lib/utils/token-generator'

describe('generateSecureToken', () => {
  it('should generate a URL-safe token', () => {
    const token = generateSecureToken()
    expect(token).toBeTruthy()
    expect(token.length).toBeGreaterThan(20)
  })
})
```

### **E2E Tests Example**
```typescript
// e2e/groups.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Groups - Security', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/groups')
    await expect(page).toHaveURL(/\/login/)
  })
})
```

---

## CI/CD Strategy

### **What Runs in CI**
✅ All unit tests (127 tests)  
✅ E2E smoke tests (UI/security tests)  
✅ TypeScript type checking  
✅ Build verification  

### **What's Skipped in CI**
⏭️ Database integration tests (require DATABASE_URL)  
⏭️ Email sending tests (require RESEND_API_KEY)  
⏭️ SMS tests (require Twilio credentials)  

### **Why This Approach?**
- **Fast CI builds**: No database setup required
- **Reliable**: No flaky external dependencies
- **Comprehensive local testing**: Full integration tests available
- **Best of both worlds**: Speed in CI, depth locally

---

## New Feature Tests (Event Invite Links)

### **Smoke Tests (Run in CI)**
Located in:
- `e2e/bulk-events.spec.ts`
- `e2e/event-invite-link.spec.ts`

**Tests:**
- ✅ UI loads without errors
- ✅ Authentication redirects work
- ✅ Public pages are accessible
- ✅ Error states display correctly

### **Integration Tests (Run Locally)**
Same files, but skipped in CI with:
```typescript
test.skip(!process.env.DATABASE_URL, 'Requires DATABASE_URL')
```

**Tests:**
- ✅ Create and update events via UI
- ✅ Generate invite tokens
- ✅ Public form submission
- ✅ Token validation and expiration
- ✅ All user flows end-to-end

---

## Running Integration Tests Locally

### **Setup**
1. **Copy environment variables**:
   ```bash
   cp env.example .env
   ```

2. **Add your DATABASE_URL**:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/circleday"
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run integration tests**:
   ```bash
   npm run test:e2e:local
   ```

### **What Happens**
- Tests create temporary test users, groups, and contacts
- Tests execute real user flows with real data
- Tests clean up all data after completion
- Database is left in clean state

---

## Test Coverage Summary

### **By Feature**
| Feature | Unit Tests | E2E Smoke | E2E Integration |
|---------|-----------|-----------|-----------------|
| Authentication | ✅ | ✅ | ✅ |
| Groups | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ |
| Reminders | ✅ | ✅ | ✅ |
| Profiles | ✅ | ✅ | ✅ |
| Bulk Events | ✅ | ✅ | ⏭️ (local) |
| Invite Links | ✅ | ✅ | ⏭️ (local) |

### **Total Tests**
- **Unit Tests**: 127 ✅
- **E2E Smoke Tests**: 44 ✅
- **E2E Integration Tests**: 20 ⏭️ (run locally)
- **Total**: 191 tests

---

## Debugging Tests

### **Failed E2E Test**
```bash
# Run with trace
npm run test:e2e -- --trace on

# View trace
npx playwright show-trace trace.zip
```

### **Failed Unit Test**
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run single test
npm test -- --grep "token generation"
```

### **Common Issues**

#### Database Connection Error
```
Error: Environment variable not found: DATABASE_URL
```
**Solution**: Integration tests require DATABASE_URL. Either:
- Add DATABASE_URL to .env for local testing
- Tests will be skipped automatically in CI

#### Playwright Browser Not Installed
```
Error: browserType.launch: Executable doesn't exist
```
**Solution**:
```bash
npx playwright install chromium
```

---

## Best Practices

### **Writing Unit Tests**
✅ Test one thing at a time  
✅ Use descriptive test names  
✅ Mock external dependencies  
✅ Keep tests fast (<100ms each)  
✅ Test edge cases  

### **Writing E2E Tests**
✅ Test user flows, not implementation  
✅ Use data-testid for reliable selectors  
✅ Wait for elements explicitly  
✅ Clean up test data  
✅ Make tests independent (no shared state)  

### **Test Naming**
```typescript
// ✅ Good
test('should redirect to login when not authenticated')

// ❌ Bad
test('test login')
```

---

## Continuous Integration

### **GitHub Actions**
Tests run automatically on:
- Every push to main
- Every pull request
- Manual workflow dispatch

### **Test Results**
- View in GitHub Actions tab
- Playwright HTML report generated
- Trace files saved for failed tests

---

## Future Enhancements

Potential testing improvements:
- [ ] Visual regression testing (Playwright screenshots)
- [ ] Performance testing (Lighthouse CI)
- [ ] Load testing (k6 or Artillery)
- [ ] Accessibility testing (axe-core)
- [ ] API contract testing (Pact)
- [ ] Mutation testing (Stryker)

---

## Questions?

For testing questions or issues:
1. Check this guide
2. Review existing tests in the codebase
3. Check Playwright documentation
4. Check Vitest documentation

**Happy Testing! 🧪✨**

