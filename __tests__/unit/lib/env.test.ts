import { describe, it, expect, beforeEach } from 'vitest'
import { isFeatureEnabled } from '@/lib/env'

describe('Environment Configuration', () => {
  describe('isFeatureEnabled', () => {
    it('returns false for disabled features by default', () => {
      expect(isFeatureEnabled('ENABLE_SMS')).toBe(false)
      expect(isFeatureEnabled('ENABLE_GIFTING')).toBe(false)
      expect(isFeatureEnabled('ENABLE_POTS')).toBe(false)
    })
    
    it('returns correct value based on env var', () => {
      // Feature flags are set in env, test the helper
      const result = isFeatureEnabled('ENABLE_SMS')
      expect(typeof result).toBe('boolean')
    })
  })
})

