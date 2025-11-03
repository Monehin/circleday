'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters').trim(),
  email: z.string().email('Invalid email address'),
  defaultTimezone: z.string().optional(),
  phone: z.string().optional(),
})

const updatePreferencesSchema = z.object({
  defaultTimezone: z.string().min(1, 'Timezone is required'),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
})

export type UserProfile = {
  id: string
  name: string | null
  email: string
  emailVerified: boolean
  defaultTimezone: string
  phone: string | null
  phoneVerified: boolean
  createdAt: Date
}

/**
 * Get current user's profile
 */
export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Fetch user with additional fields
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        defaultTimezone: true,
        phone: true,
        phoneVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    return { 
      success: true, 
      profile: user as UserProfile 
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return { error: 'Failed to fetch user profile' }
  }
}

/**
 * Update user profile (name, email, phone, timezone)
 */
export async function updateUserProfile(data: z.infer<typeof updateProfileSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = updateProfileSchema.parse(data)

    // Check if email is already taken by another user
    if (validated.email !== session.user.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validated.email,
          NOT: {
            id: session.user.id,
          },
        },
      })

      if (existingUser) {
        return { error: 'Email is already taken' }
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        email: validated.email,
        ...(validated.defaultTimezone && { defaultTimezone: validated.defaultTimezone }),
        ...(validated.phone && { phone: validated.phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        defaultTimezone: true,
        phone: true,
        phoneVerified: true,
        createdAt: true,
      },
    })

    return { 
      success: true, 
      profile: updatedUser as UserProfile 
    }
  } catch (error) {
    console.error('Failed to update user profile:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to update user profile' }
  }
}

/**
 * Update user preferences (timezone, notification settings)
 */
export async function updateUserPreferences(data: z.infer<typeof updatePreferencesSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = updatePreferencesSchema.parse(data)

    // Update user preferences
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        defaultTimezone: validated.defaultTimezone,
        // Note: emailNotifications and smsNotifications would need to be added to schema
        // For now, we just update timezone
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update preferences:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to update preferences' }
  }
}

/**
 * Get user statistics (groups, events, etc.)
 */
export async function getUserStats() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Get counts
    const [groupsCount, eventsCount, contactsCount] = await Promise.all([
      db.membership.count({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
      }),
      db.event.count({
        where: {
          contact: {
            memberships: {
              some: {
                userId: session.user.id,
                status: 'ACTIVE',
              },
            },
          },
          deletedAt: null,
        },
      }),
      db.contact.count({
        where: {
          memberships: {
            some: {
              userId: session.user.id,
              status: 'ACTIVE',
            },
          },
          deletedAt: null,
        },
      }),
    ])

    return {
      success: true,
      stats: {
        groupsCount,
        eventsCount,
        contactsCount,
      },
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return { error: 'Failed to fetch user stats' }
  }
}

