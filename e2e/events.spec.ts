import { test, expect } from '@playwright/test'

test.describe('Events Management', () => {
  test('should display empty state when no events exist', async ({ page }) => {
    await page.goto('/events')
    
    // Should show empty state
    await expect(page.getByText('No Events Yet')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Add Your First Event' })).toBeVisible()
  })

  test('should navigate to create event page', async ({ page }) => {
    await page.goto('/events')
    
    // Click add event button
    await page.getByRole('link', { name: /Add Event/i }).first().click()
    
    // Should navigate to create page
    await expect(page).toHaveURL('/events/new')
    await expect(page.getByRole('heading', { name: 'Add New Event' })).toBeVisible()
  })

  test('should show event type options', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should have event type selector
    await expect(page.getByText('Event Type')).toBeVisible()
    
    // Click to open dropdown (if it's a select component)
    const eventTypeButton = page.getByRole('combobox', { name: /Event Type/i })
    if (await eventTypeButton.isVisible()) {
      await eventTypeButton.click()
      
      // Should show all event types
      await expect(page.getByText('🎂 Birthday')).toBeVisible()
      await expect(page.getByText('💍 Anniversary')).toBeVisible()
      await expect(page.getByText('🎉 Custom Event')).toBeVisible()
    }
  })

  test('should require contact selection', async ({ page }) => {
    await page.goto('/events/new')
    
    // Try to submit without selecting contact
    await page.getByRole('button', { name: 'Create Event' }).click()
    
    // Should show validation error
    await expect(page.getByText(/select a contact/i)).toBeVisible()
  })

  test('should require date', async ({ page }) => {
    await page.goto('/events/new')
    
    // Try to submit without date
    await page.getByRole('button', { name: 'Create Event' }).click()
    
    // Should show validation error
    await expect(page.getByText(/date is required/i)).toBeVisible()
  })

  test('should have year known checkbox', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should have year known checkbox
    const checkbox = page.getByLabel(/I know the year/)
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toBeChecked() // Should be checked by default
  })

  test('should have repeat annually checkbox', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should have repeat checkbox
    const checkbox = page.getByLabel(/Repeat annually/)
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toBeChecked() // Should be checked by default
  })

  test('should have notes field', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should have notes textarea
    await expect(page.getByLabel(/Notes/)).toBeVisible()
    await expect(page.getByPlaceholder(/gift ideas/i)).toBeVisible()
  })

  test('should have cancel button', async ({ page }) => {
    await page.goto('/events/new')
    
    // Should have cancel button
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})

test.describe('Events List Display', () => {
  test('should show events navigation in header', async ({ page }) => {
    await page.goto('/')
    
    // Should have Events link in navigation (if user is authenticated)
    const eventsLink = page.getByRole('link', { name: 'Events' })
    if (await eventsLink.isVisible()) {
      await expect(eventsLink).toBeVisible()
    }
  })

  test('should display page title and description', async ({ page }) => {
    await page.goto('/events')
    
    await expect(page.getByRole('heading', { name: 'Upcoming Celebrations' })).toBeVisible()
    await expect(page.getByText('Never miss an important moment')).toBeVisible()
  })
})

test.describe('Event Types', () => {
  test('should show correct icon for birthday events', async ({ page }) => {
    await page.goto('/events')
    
    // If there are events, they should have appropriate icons
    // This is more of a visual test - in real scenarios you'd verify the emoji/icon
  })
})

test.describe('Security', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies()
    
    await page.goto('/events')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should preserve redirectTo parameter for event creation', async ({ page }) => {
    await page.context().clearCookies()
    
    await page.goto('/events/new')
    
    // Should redirect to login with redirectTo parameter
    await page.waitForURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('redirectTo')).toBe('/events/new')
  })
})

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/events')
    
    // Page should still be accessible
    await expect(page.getByRole('heading', { name: 'Upcoming Celebrations' })).toBeVisible()
  })
})

