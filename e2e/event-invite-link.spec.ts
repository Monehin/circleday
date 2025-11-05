import { test, expect } from '@playwright/test'
import { db } from '@/lib/db'
import { generateSecureToken } from '@/lib/utils/token-generator'
import { addDays } from 'date-fns'

/**
 * E2E Tests for Self-Service Event Invite Links
 * 
 * Tests the entire flow of generating invite links, sharing them,
 * and members using them to add their own events (no login required).
 */

test.describe('Event Invite Links', () => {
  let testUserId: string
  let testGroupId: string
  let testContactId: string
  let testToken: string

  test.beforeAll(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: `event-invite-${Date.now()}@test.com`,
        name: 'Event Invite Test User',
        emailVerified: true,
      },
    })
    testUserId = user.id

    // Create test group
    const group = await db.group.create({
      data: {
        name: 'Event Invite Test Group',
        ownerId: testUserId,
      },
    })
    testGroupId = group.id

    // Create test contact
    const contact = await db.contact.create({
      data: {
        name: 'Jane Doe',
        email: 'jane@test.com',
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
      await db.eventInviteToken.deleteMany({ where: { contactId: testContactId } })
      await db.contact.delete({ where: { id: testContactId } })
    }
    if (testUserId) {
      await db.session.deleteMany({ where: { userId: testUserId } })
      await db.user.delete({ where: { id: testUserId } })
    }
  })

  test('should open share link modal when clicking Share Link button', async ({ page }) => {
    await page.goto(`/groups/${testGroupId}`)
    
    // Wait for member to be visible
    await expect(page.getByText('Jane Doe')).toBeVisible()
    
    // Click "Share Link" button
    await page.getByRole('button', { name: /share link/i }).first().click()
    
    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Share Event Link with Jane Doe/i)).toBeVisible()
  })

  test('should generate an invite token and display the link', async ({ page }) => {
    await page.goto(`/groups/${testGroupId}`)
    
    // Open share link modal
    await page.getByRole('button', { name: /share link/i }).first().click()
    
    // Select 7 days expiration
    await page.getByRole('button', { name: /7 days/i }).click()
    
    // Generate link
    await page.getByRole('button', { name: /generate link/i }).click()
    
    // Should show success and generated link
    await expect(page.getByText(/link generated/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/add-events/i)).toBeVisible()
    
    // Verify token was created in database
    const tokens = await db.eventInviteToken.findMany({
      where: {
        contactId: testContactId,
        groupId: testGroupId,
      },
    })
    expect(tokens.length).toBeGreaterThan(0)
    testToken = tokens[0]!.token
  })

  test('should copy invite link to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    
    await page.goto(`/groups/${testGroupId}`)
    
    // Generate a link
    await page.getByRole('button', { name: /share link/i }).first().click()
    await page.getByRole('button', { name: /generate link/i }).click()
    await expect(page.getByText(/link generated/i)).toBeVisible({ timeout: 10000 })
    
    // Click copy button
    await page.getByRole('button', { name: /copy/i }).click()
    
    // Should show "Copied" confirmation
    await expect(page.getByText(/copied/i)).toBeVisible()
  })

  test('should allow member to access public form with valid token', async ({ page }) => {
    // Create a valid token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 1,
      },
    })

    // Navigate to public page (no login required)
    await page.goto(`/add-events/${token}`)
    
    // Should see the public form
    await expect(page.getByText(/Add Your Special Days/i)).toBeVisible()
    await expect(page.getByText(/Hi Jane Doe/i)).toBeVisible()
  })

  test('should reject expired token', async ({ page }) => {
    // Create an expired token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: new Date('2020-01-01'), // Expired
        maxUses: 1,
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Should show expired message
    await expect(page.getByText(/link expired/i)).toBeVisible()
    await expect(page.getByText(/has expired/i)).toBeVisible()
  })

  test('should reject invalid token format', async ({ page }) => {
    await page.goto('/add-events/invalid-short-token')
    
    // Should show invalid message
    await expect(page.getByText(/invalid link/i)).toBeVisible()
  })

  test('should submit events via public form', async ({ page }) => {
    // Create a valid token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 3,
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Wait for form to load
    await expect(page.getByText(/Add Your Special Days/i)).toBeVisible()
    
    // Fill in birthday
    await page.locator('#birthday-date').fill('1985-03-25')
    
    // Fill in anniversary
    await page.locator('#anniversary-date').fill('2010-08-15')
    
    // Submit
    await page.getByRole('button', { name: /submit my events/i }).click()
    
    // Should show success message
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/saved successfully/i)).toBeVisible()
    
    // Verify events were created
    const events = await db.event.findMany({
      where: {
        contactId: testContactId,
      },
    })
    expect(events.length).toBeGreaterThanOrEqual(2)
    
    // Verify token usage was incremented
    const tokenData = await db.eventInviteToken.findUnique({
      where: { token },
    })
    expect(tokenData?.useCount).toBe(1)
    expect(tokenData?.usedAt).not.toBeNull()
  })

  test('should add custom events via public form', async ({ page }) => {
    // Create a valid token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 3,
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Add a custom event
    await page.getByRole('button', { name: /add event/i }).click()
    
    // Fill in custom event details
    await page.locator('input[placeholder*="Graduation"]').first().fill('Work Anniversary')
    await page.locator('input[type="date"]').nth(2).fill('2015-09-01')
    
    // Submit
    await page.getByRole('button', { name: /submit my events/i }).click()
    
    // Should show success
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 })
    
    // Verify custom event was created
    const customEvents = await db.event.findMany({
      where: {
        contactId: testContactId,
        type: 'CUSTOM',
      },
    })
    expect(customEvents.length).toBeGreaterThan(0)
    expect(customEvents[0]?.title).toBe('Work Anniversary')
  })

  test('should enforce max uses limit', async ({ page }) => {
    // Create a token with max uses of 1
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 1,
        useCount: 1, // Already used once
        usedAt: new Date(),
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Should show max uses exceeded message
    await expect(page.getByText(/link no longer valid/i)).toBeVisible()
    await expect(page.getByText(/maximum number of times/i)).toBeVisible()
  })

  test('should allow private age option for birthday', async ({ page }) => {
    // Create a valid token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 3,
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Fill in birthday
    await page.locator('#birthday-date').fill('1985-03-25')
    
    // Check "Keep my age private"
    await page.getByText(/keep my age private/i).click()
    
    // Submit
    await page.getByRole('button', { name: /submit my events/i }).click()
    
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 })
    
    // Verify event was created with yearKnown = false
    const birthday = await db.event.findFirst({
      where: {
        contactId: testContactId,
        type: 'BIRTHDAY',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    expect(birthday?.yearKnown).toBe(false)
  })

  test('should validate that at least one event is required in public form', async ({ page }) => {
    // Create a valid token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 3,
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Try to submit without any events
    await page.getByRole('button', { name: /submit my events/i }).click()
    
    // Should show validation error (browser alert)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('at least one event')
      await dialog.accept()
    })
  })

  test('should pre-populate existing events in public form', async ({ page }) => {
    // Create existing birthday
    await db.event.create({
      data: {
        contactId: testContactId,
        type: 'BIRTHDAY',
        date: new Date('1985-03-25'),
        yearKnown: true,
      },
    })

    // Create a valid token
    const token = generateSecureToken()
    await db.eventInviteToken.create({
      data: {
        token,
        contactId: testContactId,
        groupId: testGroupId,
        createdBy: testUserId,
        expiresAt: addDays(new Date(), 7),
        maxUses: 3,
      },
    })

    await page.goto(`/add-events/${token}`)
    
    // Wait for form to load
    await expect(page.getByText(/Add Your Special Days/i)).toBeVisible()
    
    // Birthday field should be pre-populated
    const birthdayInput = page.locator('#birthday-date')
    await expect(birthdayInput).toHaveValue('1985-03-25')
  })
})

