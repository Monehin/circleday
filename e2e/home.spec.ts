import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/CircleDay/)
    
    // Check main heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('CircleDay')
    
    // Check tagline
    await expect(page.locator('text=Never miss a celebration')).toBeVisible()
    
    // Check version info
    await expect(page.locator('text=Running on Next.js 16')).toBeVisible()
  })
  
  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('/')
    
    expect(response?.headers()['x-frame-options']).toBe('DENY')
    expect(response?.headers()['x-content-type-options']).toBe('nosniff')
  })
})

test.describe('Health Check API', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.version).toBe('0.1.0')
    expect(data.env).toBe('development')
  })
})

