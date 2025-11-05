/**
 * Token Generation Utilities
 * 
 * Provides cryptographically secure token generation for event invite links.
 * Uses Node.js crypto module for maximum security.
 */

import { randomBytes } from 'crypto'

/**
 * Generates a cryptographically secure, URL-safe random token
 * 
 * @param byteLength - Number of random bytes to generate (default: 32)
 * @returns URL-safe base64 encoded token string
 * 
 * @example
 * const token = generateSecureToken()
 * // Returns: "xY9kL2mP4nQ7rS8tU1vW3xZ5aC6bD8eF0gH2iJ4kL6mN8oP0qR2sT4uV6wX8yZ0"
 */
export function generateSecureToken(byteLength: number = 32): string {
  return randomBytes(byteLength).toString('base64url')
}

/**
 * Generates a shorter, human-readable code for verification purposes
 * 
 * @param length - Length of the code (default: 6)
 * @returns Alphanumeric code in uppercase
 * 
 * @example
 * const code = generateShortCode()
 * // Returns: "X9K2M4"
 */
export function generateShortCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars: 0,O,1,I
  let result = ''
  const bytes = randomBytes(length)
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i]! % chars.length]
  }
  
  return result
}

/**
 * Validates a token format (basic check for URL-safe base64url)
 * 
 * @param token - Token to validate
 * @returns True if token appears to be a valid format
 */
export function isValidTokenFormat(token: string): boolean {
  // base64url uses: A-Z, a-z, 0-9, -, _
  const base64urlPattern = /^[A-Za-z0-9_-]+$/
  return base64urlPattern.test(token) && token.length >= 20
}

