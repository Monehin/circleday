import { test, expect } from '@playwright/test'

test.describe('Events Management - Security', () => {
  test('should redirect to login when accessing events without auth', async ({ page }) => {
    await page.goto('/events')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Welcome to CircleDay' })).toBeVisible()
  })

  test('should redirect to login when accessing create event without auth', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Welcome to CircleDay' })).toBeVisible()
  })

  test('should preserve redirectTo parameter when redirecting from events', async ({ page }) => {
    await page.goto('/events')
    
    // Should redirect to login with redirectTo parameter
    await page.waitForURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('redirectTo')).toBe('/events')
  })

  test('should preserve redirectTo parameter when redirecting from events/new', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should redirect to login with redirectTo parameter
    await page.waitForURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('redirectTo')).toBe('/events/new')
  })

  test('should redirect to login when accessing event detail without auth', async ({ page }) => {
    await page.goto('/events/test-event-id')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Events - Responsive Design', () => {
  test('should redirect mobile users to login for protected routes', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/events')
    
    // Should redirect to login (security check)
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Welcome to CircleDay' })).toBeVisible()
  })
})

