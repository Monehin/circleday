import { describe, it, expect } from 'vitest'
import {
  generateReminderSMS,
  generateEventUpdateSMS,
  generateGroupInviteSMS,
} from '@/lib/sms/templates/reminder'

describe('SMS Templates', () => {
  describe('generateReminderSMS', () => {
    it('should generate SMS for event today (day 0)', () => {
      const sms = generateReminderSMS({
        contactName: 'John Doe',
        eventType: 'BIRTHDAY',
        eventTitle: null,
        eventDate: new Date('2024-12-25'),
        daysUntil: 0,
        groupName: 'Family',
        appUrl: 'https://circleday.app',
      })

      expect(sms).toContain('Today is')
      expect(sms).toContain("John Doe's birthday")
      expect(sms).toContain('🎉')
      expect(sms).toContain('[Family]')
      expect(sms).toContain('https://circleday.app')
    })

    it('should generate SMS for event tomorrow (day 1)', () => {
      const sms = generateReminderSMS({
        contactName: 'Jane Smith',
        eventType: 'ANNIVERSARY',
        eventTitle: null,
        eventDate: new Date('2024-12-26'),
        daysUntil: 1,
        groupName: 'Work Team',
        appUrl: 'https://circleday.app',
      })

      expect(sms).toContain('Tomorrow is')
      expect(sms).toContain("Jane Smith's anniversary")
      expect(sms).toContain('⏰')
      expect(sms).toContain('[Work Team]')
    })

    it('should generate SMS for event within a week', () => {
      const sms = generateReminderSMS({
        contactName: 'Bob Johnson',
        eventType: 'BIRTHDAY',
        eventTitle: null,
        eventDate: new Date('2024-12-30'),
        daysUntil: 5,
        groupName: 'Friends',
        appUrl: 'https://circleday.app',
      })

      expect(sms).toContain('in 5 days')
      expect(sms).toContain("Bob Johnson's birthday")
      expect(sms).toContain('📅')
      expect(sms).toContain('[Friends]')
    })

    it('should generate SMS for event more than a week away', () => {
      const sms = generateReminderSMS({
        contactName: 'Alice Williams',
        eventType: 'CUSTOM',
        eventTitle: 'Graduation Party',
        eventDate: new Date('2024-12-31'),
        daysUntil: 14,
        groupName: 'School',
        appUrl: 'https://circleday.app',
      })

      expect(sms).toContain('Reminder:')
      expect(sms).toContain('Graduation Party')
      expect(sms).toContain('coming up on')
      expect(sms).toContain('[School]')
    })

    it('should use custom event title when provided', () => {
      const sms = generateReminderSMS({
        contactName: 'Charlie Brown',
        eventType: 'CUSTOM',
        eventTitle: 'Retirement Party',
        eventDate: new Date('2024-12-25'),
        daysUntil: 3,
        groupName: 'Office',
        appUrl: 'https://circleday.app',
      })

      expect(sms).toContain('Retirement Party')
      expect(sms).not.toContain("Charlie Brown's custom")
    })

    it('should include group name if message is not too long', () => {
      const sms = generateReminderSMS({
        contactName: 'Short',
        eventType: 'BIRTHDAY',
        eventTitle: null,
        eventDate: new Date('2024-12-25'),
        daysUntil: 0,
        groupName: 'Fam',
        appUrl: 'https://circleday.app',
      })

      expect(sms).toContain('[Fam]')
    })
  })

  describe('generateEventUpdateSMS', () => {
    it('should generate SMS for event updates', () => {
      const sms = generateEventUpdateSMS({
        contactName: 'John Doe',
        eventType: 'BIRTHDAY',
        changeDescription: 'Date changed to Dec 26',
        groupName: 'Family',
      })

      expect(sms).toContain('[Family]')
      expect(sms).toContain('Update:')
      expect(sms).toContain("John Doe's birthday")
      expect(sms).toContain('Date changed to Dec 26')
    })

    it('should handle custom events', () => {
      const sms = generateEventUpdateSMS({
        contactName: 'Jane Smith',
        eventType: 'CUSTOM',
        changeDescription: 'Cancelled',
        groupName: 'Work',
      })

      expect(sms).toContain("Jane Smith's custom")
      expect(sms).toContain('Cancelled')
    })
  })

  describe('generateGroupInviteSMS', () => {
    it('should generate SMS for group invitations', () => {
      const sms = generateGroupInviteSMS({
        groupName: 'My Family',
        inviterName: 'John Doe',
        inviteLink: 'https://circleday.app/invite/abc123',
      })

      expect(sms).toContain('John Doe')
      expect(sms).toContain('invited you to join')
      expect(sms).toContain('"My Family"')
      expect(sms).toContain('CircleDay')
      expect(sms).toContain('https://circleday.app/invite/abc123')
    })

    it('should be concise and readable', () => {
      const sms = generateGroupInviteSMS({
        groupName: 'Test Group',
        inviterName: 'Alice',
        inviteLink: 'https://example.com/i/xyz',
      })

      // Should be reasonably short for SMS
      expect(sms.length).toBeLessThan(200)
      // Should have the essential information
      expect(sms).toContain('Alice')
      expect(sms).toContain('invited')
      expect(sms).toContain('Test Group')
      expect(sms).toContain('https://example.com')
    })
  })
})

