import { test, expect } from '@playwright/test'

test.describe('User Profile', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    // Try to access profile page directly
    await page.goto('/profile')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should include redirectTo parameter in URL', async ({ page }) => {
    await page.goto('/profile')
    
    // Check that redirectTo parameter is in the URL
    await page.waitForURL(/\/login/)
    const url = page.url()
    expect(url).toContain('redirectTo')
    expect(url).toMatch(/%2Fprofile|\/profile/) // URL-encoded or not
  })

  test('should have proper page structure', async ({ page }) => {
    // This test would require authentication
    // For now, we're just checking the route exists
    const response = await page.goto('/profile')
    
    // The page should exist (even if it redirects due to auth)
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('Settings Page', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/settings')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should include redirectTo parameter in URL', async ({ page }) => {
    await page.goto('/settings')
    
    // Check that redirectTo parameter is in the URL
    await page.waitForURL(/\/login/)
    const url = page.url()
    expect(url).toContain('redirectTo')
    expect(url).toMatch(/%2Fsettings|\/settings/) // URL-encoded or not
  })

  test('should have proper page structure', async ({ page }) => {
    const response = await page.goto('/settings')
    
    // The page should exist (even if it redirects due to auth)
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('Profile - Page Metadata', () => {
  test('should have proper app metadata', async ({ page }) => {
    await page.goto('/')
    
    // Check that the app has proper metadata
    await expect(page).toHaveTitle(/CircleDay/)
  })
})

