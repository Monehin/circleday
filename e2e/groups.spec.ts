import { test, expect } from '@playwright/test'

test.describe('Groups Management - Security', () => {
  test('should redirect to login when accessing groups without auth', async ({ page }) => {
    await page.goto('/groups')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Welcome to CircleDay' })).toBeVisible()
  })

  test('should redirect to login when accessing create group without auth', async ({ page }) => {
    await page.goto('/groups/new')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Welcome to CircleDay' })).toBeVisible()
  })

  test('should preserve redirectTo parameter when redirecting from groups', async ({ page }) => {
    await page.goto('/groups')
    
    // Should redirect to login with redirectTo parameter
    await page.waitForURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('redirectTo')).toBe('/groups')
  })

  test('should preserve redirectTo parameter when redirecting from groups/new', async ({ page }) => {
    await page.goto('/groups/new')
    
    // Should redirect to login with redirectTo parameter
    await page.waitForURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('redirectTo')).toBe('/groups/new')
  })

  test('should redirect to login when accessing group detail without auth', async ({ page }) => {
    await page.goto('/groups/test-group-id')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})


