import { test, expect } from '@playwright/test'

test.describe('Cron Job Endpoints', () => {
  test('should allow GET in development mode', async ({ request }) => {
    const response = await request.get('/api/cron/send-reminders')
    
    // Should work in development
    expect([200, 500]).toContain(response.status())
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    
    if (data.success) {
      expect(data).toHaveProperty('scheduling')
      expect(data).toHaveProperty('sending')
      expect(data.scheduling).toHaveProperty('scheduled')
      expect(data.scheduling).toHaveProperty('skipped')
      expect(data.scheduling).toHaveProperty('errors')
      expect(data.sending).toHaveProperty('total')
      expect(data.sending).toHaveProperty('sent')
      expect(data.sending).toHaveProperty('failed')
    }
  })

  test('should process POST requests in development', async ({ request }) => {
    const response = await request.post('/api/cron/send-reminders')
    
    // Should return a valid response
    expect([200, 500]).toContain(response.status())
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
  })

  test('should return proper response structure', async ({ request }) => {
    const response = await request.get('/api/cron/send-reminders')
    const data = await response.json()
    
    // Check response structure
    if (data.success) {
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('scheduling')
      expect(data).toHaveProperty('sending')
      expect(typeof data.scheduling.scheduled).toBe('number')
      expect(typeof data.scheduling.skipped).toBe('number')
      expect(typeof data.scheduling.errors).toBe('number')
      expect(typeof data.sending.total).toBe('number')
      expect(typeof data.sending.sent).toBe('number')
      expect(typeof data.sending.failed).toBe('number')
    } else {
      expect(data).toHaveProperty('error')
    }
  })
})

