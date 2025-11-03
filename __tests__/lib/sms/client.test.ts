import { describe, it, expect } from 'vitest'
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/sms/client'

describe('SMS Client', () => {
  describe('formatPhoneNumber', () => {
    it('should handle E.164 formatted numbers (already valid)', () => {
      expect(formatPhoneNumber('+14155552671')).toBe('+14155552671')
      expect(formatPhoneNumber('+442071838750')).toBe('+442071838750')
      expect(formatPhoneNumber('+33612345678')).toBe('+33612345678')
    })

    it('should format 10-digit US numbers', () => {
      expect(formatPhoneNumber('4155552671')).toBe('+14155552671')
      expect(formatPhoneNumber('2125551234')).toBe('+12125551234')
    })

    it('should format 11-digit US numbers with leading 1', () => {
      expect(formatPhoneNumber('14155552671')).toBe('+14155552671')
      expect(formatPhoneNumber('12125551234')).toBe('+12125551234')
    })

    it('should remove formatting characters', () => {
      expect(formatPhoneNumber('(415) 555-2671')).toBe('+14155552671')
      expect(formatPhoneNumber('415.555.2671')).toBe('+14155552671')
      expect(formatPhoneNumber('415 555 2671')).toBe('+14155552671')
    })

    it('should handle mixed formatting', () => {
      expect(formatPhoneNumber('+1 (415) 555-2671')).toBe('+14155552671')
      expect(formatPhoneNumber('+44 20 7183 8750')).toBe('+442071838750')
    })
  })

  describe('isValidPhoneNumber', () => {
    it('should validate correct E.164 phone numbers', () => {
      expect(isValidPhoneNumber('+14155552671')).toBe(true)
      expect(isValidPhoneNumber('+442071838750')).toBe(true)
      expect(isValidPhoneNumber('+33612345678')).toBe(true)
      expect(isValidPhoneNumber('+85212345678')).toBe(true)
    })

    it('should validate formatted US numbers', () => {
      expect(isValidPhoneNumber('4155552671')).toBe(true)
      expect(isValidPhoneNumber('(415) 555-2671')).toBe(true)
      expect(isValidPhoneNumber('415.555.2671')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false) // Too short
      expect(isValidPhoneNumber('+0123456789')).toBe(false) // Starts with 0
      expect(isValidPhoneNumber('notaphone')).toBe(false) // Not a number
      expect(isValidPhoneNumber('')).toBe(false) // Empty
      expect(isValidPhoneNumber('+1234567890123456')).toBe(false) // Too long (>15 digits)
    })

    it('should handle edge cases', () => {
      expect(isValidPhoneNumber('+1')).toBe(false) // Too short
      expect(isValidPhoneNumber('+1234567')).toBe(true) // Minimum valid (7 digits total)
      expect(isValidPhoneNumber('+123456789012345')).toBe(true) // Maximum valid E.164 (15 digits)
      expect(isValidPhoneNumber('+1234567890123456')).toBe(false) // Too long (16 digits)
    })
  })
})

