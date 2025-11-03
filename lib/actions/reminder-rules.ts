'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// Validation schemas
const channelConfigSchema = z.record(
  z.string(),
  z.array(z.enum(['EMAIL', 'SMS']))
)

const createReminderRuleSchema = z.object({
  groupId: z.string(),
  offsets: z.array(z.number()).min(1, 'At least one reminder offset is required'),
  channels: channelConfigSchema,
  sendHour: z.number().min(0).max(23).default(9),
})

const updateReminderRuleSchema = z.object({
  id: z.string(),
  offsets: z.array(z.number()).min(1).optional(),
  channels: channelConfigSchema.optional(),
  sendHour: z.number().min(0).max(23).optional(),
})

export type ReminderRuleListItem = {
  id: string
  groupId: string
  offsets: number[]
  channels: Record<string, string[]>
  sendHour: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all reminder rules for a group
 */
export async function getReminderRules(groupId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Check if user is a member of the group
    const membership = await db.membership.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return { error: 'You do not have access to this group' }
    }

    // Fetch reminder rules for the group
    const rules = await db.reminderRule.findMany({
      where: {
        groupId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { 
      success: true, 
      rules: rules as ReminderRuleListItem[] 
    }
  } catch (error) {
    console.error('Failed to fetch reminder rules:', error)
    return { error: 'Failed to fetch reminder rules' }
  }
}

/**
 * Create a new reminder rule for a group
 */
export async function createReminderRule(data: z.infer<typeof createReminderRuleSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = createReminderRuleSchema.parse(data)

    // Check if user is owner or admin of the group
    const membership = await db.membership.findFirst({
      where: {
        groupId: validated.groupId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return { error: 'You do not have permission to create reminder rules for this group' }
    }

    // Create the reminder rule
    const rule = await db.reminderRule.create({
      data: {
        groupId: validated.groupId,
        offsets: validated.offsets,
        channels: validated.channels,
        sendHour: validated.sendHour,
      },
    })

    return { success: true, rule: rule as ReminderRuleListItem }
  } catch (error) {
    console.error('Failed to create reminder rule:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to create reminder rule' }
  }
}

/**
 * Update an existing reminder rule
 */
export async function updateReminderRule(data: z.infer<typeof updateReminderRuleSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = updateReminderRuleSchema.parse(data)

    // Get the rule to check group ownership
    const existingRule = await db.reminderRule.findUnique({
      where: { id: validated.id },
      include: {
        group: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
                role: {
                  in: ['OWNER', 'ADMIN'],
                },
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    })

    if (!existingRule) {
      return { error: 'Reminder rule not found' }
    }

    if (existingRule.group.memberships.length === 0) {
      return { error: 'You do not have permission to update this reminder rule' }
    }

    // Update the rule
    const rule = await db.reminderRule.update({
      where: { id: validated.id },
      data: {
        ...(validated.offsets && { offsets: validated.offsets }),
        ...(validated.channels && { channels: validated.channels }),
        ...(validated.sendHour !== undefined && { sendHour: validated.sendHour }),
      },
    })

    return { success: true, rule: rule as ReminderRuleListItem }
  } catch (error) {
    console.error('Failed to update reminder rule:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to update reminder rule' }
  }
}

/**
 * Delete a reminder rule
 */
export async function deleteReminderRule(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Get the rule to check group ownership
    const existingRule = await db.reminderRule.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
                role: {
                  in: ['OWNER', 'ADMIN'],
                },
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    })

    if (!existingRule) {
      return { error: 'Reminder rule not found' }
    }

    if (existingRule.group.memberships.length === 0) {
      return { error: 'You do not have permission to delete this reminder rule' }
    }

    // Delete the rule
    await db.reminderRule.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete reminder rule:', error)
    return { error: 'Failed to delete reminder rule' }
  }
}

