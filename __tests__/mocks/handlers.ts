import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock health check (example)
  http.get('http://localhost:3000/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  }),
  
  // Add more handlers as we build features
  // Mock Resend API
  // Mock Stripe API
  // Mock Twilio API
]

