import { z } from 'zod'

// Email validation schema
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
})

// Login form schema
export const loginSchema = emailSchema

// Signup schema (for future use)
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
})

// Password reset schema (for future use)
export const passwordResetSchema = emailSchema

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>

