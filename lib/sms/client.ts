import twilio from 'twilio'

// Twilio configuration
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client (only if credentials are provided)
export const twilioClient =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null

/**
 * Check if SMS sending is enabled
 */
export function isSMSEnabled(): boolean {
  return !!twilioClient && !!TWILIO_PHONE_NUMBER
}

/**
 * Format phone number to E.164 format (required by Twilio)
 * Examples:
 * - +14155552671 (valid)
 * - +442071838750 (valid)
 * - (415) 555-2671 -> +14155552671
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // If it doesn't start with +, assume US/Canada (+1)
  if (!cleaned.startsWith('+')) {
    // If it's 10 digits, assume US/Canada
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned
    } else if (cleaned.length > 0) {
      // For all other numbers, add + prefix
      cleaned = '+' + cleaned
    }
  }
  
  return cleaned
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return false
  
  const formatted = formatPhoneNumber(phone)
  // E.164 format: + followed by country code (1-3 digits) and number (minimum 7 total digits)
  // This ensures we have at least +[country][7-digit number]
  return /^\+[1-9]\d{6,14}$/.test(formatted)
}

