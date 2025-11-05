import { test, expect } from '@playwright/test'
import { db } from '@/lib/db'

/**
 * E2E Tests for Bulk Event Addition
 * 
 * Tests the "Add Events" modal functionality for quickly adding
 * multiple events (birthday, anniversary, custom) for a member.
 */

test.describe('Bulk Event Addition', () => {
  let testUserId: string
  let testGroupId: string
  let testContactId: string

  test.beforeAll(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: `bulk-events-${Date.now()}@test.com`,
        name: 'Bulk Events Test User',
        emailVerified: true,
      },
    })
    testUserId = user.id

    // Create test group
    const group = await db.group.create({
      data: {
        name: 'Bulk Events Test Group',
        ownerId: testUserId,
      },
    })
    testGroupId = group.id

    // Create test contact
    const contact = await db.contact.create({
      data: {
        name: 'Test Member',
        email: 'member@test.com',
        phone: '+1234567890',
      },
    })
    testContactId = contact.id

    // Add contact as member
    await db.membership.create({
      data: {
        groupId: testGroupId,
        contactId: testContactId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })
  })

  test.afterAll(async () => {
    // Cleanup
    if (testGroupId) {
      await db.membership.deleteMany({ where: { groupId: testGroupId } })
      await db.group.delete({ where: { id: testGroupId } })
    }
    if (testContactId) {
      await db.event.deleteMany({ where: { contactId: testContactId } })
      await db.contact.delete({ where: { id: testContactId } })
    }
    if (testUserId) {
      await db.session.deleteMany({ where: { userId: testUserId } })
      await db.user.delete({ where: { id: testUserId } })
    }
  })

  test('should open add events modal when clicking Add Events button', async ({ page }) => {
    // Login and navigate to group detail page
    await page.goto(`/groups/${testGroupId}`)
    
    // Wait for the page to load
    await expect(page.getByText('Test Member')).toBeVisible()
    
    // Click "Add Events" button for the member
    await page.getByRole('button', { name: /add events/i }).first().click()
    
    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Add Events for Test Member/i)).toBeVisible()
  })

  test('should add birthday for a member', async ({ page }) => {
    await page.goto(`/groups/${testGroupId}`)
    
    // Open add events modal
    await page.getByRole('button', { name: /add events/i }).first().click()
    
    // Fill in birthday
    await page.locator('#birthday-date').fill('1990-01-15')
    
    // Submit
    await page.getByRole('button', { name: /save all events/i }).click()
    
    // Should show success message
    await expect(page.getByText(/successfully added/i)).toBeVisible({ timeout: 10000 })
    
    // Verify event was created in database
    const events = await db.event.findMany({
      where: {
        contactId: testContactId,
        type: 'BIRTHDAY',
      },
    })
    expect(events.length).toBe(1)
    expect(events[0]?.yearKnown).toBe(true)
  })

  test('should add multiple events at once', async ({ page }) => {
    await page.goto(`/groups/${testGroupId}`)
    
    // Open add events modal
    await page.getByRole('button', { name: /add events/i }).first().click()
    
    // Fill in birthday
    await page.locator('#birthday-date').fill('1990-01-15')
    await page.locator('#birthday-notes').fill('Loves chocolate cake')
    
    // Fill in anniversary
    await page.locator('#anniversary-date').fill('2015-06-20')
    await page.locator('#anniversary-notes').fill('Wedding anniversary')
    
    // Add a custom event
    await page.getByRole('button', { name: /add custom event/i }).click()
    await page.locator('input[placeholder*="Graduation"]').first().fill('College Graduation')
    await page.locator('input[type="date"]').nth(2).fill('2012-05-10')
    
    // Submit
    await page.getByRole('button', { name: /save all events/i }).click()
    
    // Should show success message with count
    await expect(page.getByText(/successfully added 3 event/i)).toBeVisible({ timeout: 10000 })
    
    // Verify all events were created
    const events = await db.event.findMany({
      where: {
        contactId: testContactId,
      },
    })
    expect(events.length).toBeGreaterThanOrEqual(3)
  })

  test('should update existing birthday when adding again', async ({ page }) => {
    // First, create a birthday
    await db.event.create({
      data: {
        contactId: testContactId,
        type: 'BIRTHDAY',
        date: new Date('1990-01-15'),
        yearKnown: true,
      },
    })
    
    await page.goto(`/groups/${testGroupId}`)
    
    // Open add events modal (should pre-populate existing birthday)
    await page.getByRole('button', { name: /add events/i }).first().click()
    
    // Wait for form to load existing events
    await page.waitForTimeout(1000)
    
    // Change the date
    await page.locator('#birthday-date').fill('1990-02-20')
    
    // Submit
    await page.getByRole('button', { name: /save all events/i }).click()
    
    await expect(page.getByText(/successfully added/i)).toBeVisible({ timeout: 10000 })
    
    // Should still only have one birthday (updated, not duplicate)
    const events = await db.event.findMany({
      where: {
        contactId: testContactId,
        type: 'BIRTHDAY',
      },
    })
    expect(events.length).toBe(1)
  })

  test('should validate that at least one event is required', async ({ page }) => {
    await page.goto(`/groups/${testGroupId}`)
    
    // Open add events modal
    await page.getByRole('button', { name: /add events/i }).first().click()
    
    // Try to submit without filling anything
    await page.getByRole('button', { name: /save all events/i }).click()
    
    // Should show error
    await expect(page.getByText(/at least one event/i)).toBeVisible()
  })

  test('should remove custom events from the form', async ({ page }) => {
    await page.goto(`/groups/${testGroupId}`)
    
    // Open add events modal
    await page.getByRole('button', { name: /add events/i }).first().click()
    
    // Add two custom events
    await page.getByRole('button', { name: /add custom event/i }).click()
    await page.getByRole('button', { name: /add custom event/i }).click()
    
    // Should have 2 custom event forms
    const customEventForms = page.locator('.bg-blue-50')
    await expect(customEventForms).toHaveCount(2)
    
    // Remove one
    await page.locator('button').filter({ hasText: /trash/i }).first().click()
    
    // Should now have 1
    await expect(customEventForms).toHaveCount(1)
  })
})

