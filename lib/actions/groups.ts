'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  type: z.enum(['PERSONAL', 'TEAM']).default('PERSONAL'),
  defaultTimezone: z.string().optional(),
  maxEventsPerMember: z.number().int().positive().optional().nullable(),
})

export async function createGroup(data: z.infer<typeof createGroupSchema>) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = createGroupSchema.parse(data)

    // Create group and initial membership in a transaction
    const group = await db.$transaction(async (tx) => {
      // Create the group
      const newGroup = await tx.group.create({
        data: {
          name: validated.name,
          type: validated.type || 'PERSONAL',
          ownerId: session.user.id,
          defaultTimezone: validated.defaultTimezone || 'UTC',
          maxEventsPerMember: validated.maxEventsPerMember || null,
        },
      })

      // Create or get contact for the owner
      const ownerContact = await tx.contact.upsert({
        where: {
          id: `user_${session.user.id}`,
        },
        create: {
          id: `user_${session.user.id}`,
          name: session.user.name || session.user.email,
          email: session.user.email,
          timezone: validated.defaultTimezone || 'UTC',
        },
        update: {},
      })

      // Create owner membership
      await tx.membership.create({
        data: {
          groupId: newGroup.id,
          userId: session.user.id,
          contactId: ownerContact.id,
          role: 'OWNER',
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          groupId: newGroup.id,
          method: 'CREATE',
          entity: 'Group',
          entityId: newGroup.id,
          diffJson: { new: { name: validated.name } },
        },
      })

      return newGroup
    })

    return { success: true, group }
  } catch (error) {
    console.error('Failed to create group:', error)
    return { error: 'Failed to create group' }
  }
}

export async function getGroups() {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Fetch groups where user is a member
    const groups = await db.group.findMany({
      where: {
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { 
      success: true, 
      groups: groups.map(group => ({
        id: group.id,
        name: group.name,
        memberCount: group._count.memberships,
        upcomingEvents: 0, // TODO: Calculate based on contacts' events
        createdAt: group.createdAt,
      }))
    }
  } catch (error) {
    console.error('Failed to fetch groups:', error)
    return { error: 'Failed to fetch groups' }
  }
}

export async function getGroupById(groupId: string) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Fetch group with members
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                timezone: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            role: 'asc', // OWNER first, then ADMIN, then MEMBER
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    })

    if (!group) {
      return { error: 'Group not found' }
    }

    // Fetch event counts for all contacts in this group
    const contactIds = group.memberships.map(m => m.contact.id)
    const eventCounts = await db.event.groupBy({
      by: ['contactId'],
      where: {
        contactId: { in: contactIds },
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    })

    // Create a map of contactId -> event count
    const eventCountMap = new Map(
      eventCounts.map(ec => [ec.contactId, ec._count.id])
    )

    return { 
      success: true, 
      group: {
        id: group.id,
        name: group.name,
        type: group.type,
        ownerId: group.ownerId,
        owner: group.owner,
        defaultTimezone: group.defaultTimezone,
        maxEventsPerMember: group.maxEventsPerMember,
        remindersEnabled: group.remindersEnabled,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        memberCount: group._count.memberships,
        members: group.memberships.map(m => ({
          id: m.id,
          role: m.role,
          status: m.status,
          contact: m.contact,
          user: m.user,
          createdAt: m.createdAt,
          eventCount: eventCountMap.get(m.contact.id) || 0,
        })),
      }
    }
  } catch (error) {
    console.error('Failed to fetch group:', error)
    return { error: 'Failed to fetch group' }
  }
}

const updateGroupSchema = z.object({
  groupId: z.string(),
  name: z.string().min(2).max(50).trim().optional(),
  defaultTimezone: z.string().optional(),
})

export async function updateGroup(data: z.infer<typeof updateGroupSchema>) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = updateGroupSchema.parse(data)

    // Check if user is owner or admin
    const membership = await db.membership.findFirst({
      where: {
        groupId: validated.groupId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    })

    if (!membership) {
      return { error: 'You do not have permission to edit this group' }
    }

    // Get old group data for audit log
    const oldGroup = await db.group.findUnique({
      where: { id: validated.groupId },
      select: { name: true, defaultTimezone: true },
    })

    // Update group
    const updatedGroup = await db.$transaction(async (tx) => {
      const group = await tx.group.update({
        where: { id: validated.groupId },
        data: {
          ...(validated.name && { name: validated.name }),
          ...(validated.defaultTimezone && { defaultTimezone: validated.defaultTimezone }),
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          groupId: validated.groupId,
          method: 'UPDATE',
          entity: 'Group',
          entityId: validated.groupId,
          diffJson: {
            old: oldGroup,
            new: {
              ...(validated.name && { name: validated.name }),
              ...(validated.defaultTimezone && { defaultTimezone: validated.defaultTimezone }),
            },
          },
        },
      })

      return group
    })

    return { success: true, group: updatedGroup }
  } catch (error) {
    console.error('Failed to update group:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    return { error: 'Failed to update group' }
  }
}

const addMemberSchema = z.object({
  groupId: z.string(),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().trim().optional(),
  phone: z.string().trim().optional(),
  timezone: z.string().optional(),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
})

export async function addMember(data: z.infer<typeof addMemberSchema>) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = addMemberSchema.parse(data)

    // Check if user is owner or admin
    const membership = await db.membership.findFirst({
      where: {
        groupId: validated.groupId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    })

    if (!membership) {
      return { error: 'You do not have permission to add members to this group' }
    }

    // Create contact and membership in a transaction
    const result = await db.$transaction(async (tx) => {
      // Check if contact with same email or phone already exists
      const existingContact = await tx.contact.findFirst({
        where: {
          OR: [
            validated.email ? { email: validated.email } : {},
            validated.phone ? { phone: validated.phone } : {},
          ].filter(obj => Object.keys(obj).length > 0), // Filter out empty objects
        },
      })

      let contact
      if (existingContact) {
        // Check if already a member of this group
        const existingMembership = await tx.membership.findUnique({
          where: {
            groupId_contactId: {
              groupId: validated.groupId,
              contactId: existingContact.id,
            },
          },
        })

        if (existingMembership) {
          throw new Error('This contact is already a member of the group')
        }

        contact = existingContact
      } else {
        // Create new contact
        contact = await tx.contact.create({
          data: {
            name: validated.name,
            email: validated.email,
            phone: validated.phone,
            timezone: validated.timezone || session.user.defaultTimezone || 'UTC',
          },
        })
      }

      // Create membership
      const newMembership = await tx.membership.create({
        data: {
          groupId: validated.groupId,
          contactId: contact.id,
          role: validated.role,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              timezone: true,
            },
          },
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          groupId: validated.groupId,
          method: 'CREATE',
          entity: 'Membership',
          entityId: newMembership.id,
          diffJson: {
            new: {
              contactId: contact.id,
              contactName: contact.name,
              role: validated.role,
            },
          },
        },
      })

      return newMembership
    })

    return { success: true, membership: result }
  } catch (error) {
    console.error('Failed to add member:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to add member' }
  }
}

/**
 * Toggle reminders for a group
 */
export async function toggleGroupReminders(groupId: string, enabled: boolean) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Check if user is the owner
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        ownerId: session.user.id,
        deletedAt: null,
      },
    })

    if (!group) {
      return { error: 'Group not found or you do not have permission' }
    }

    // Update the group
    const updated = await db.group.update({
      where: { id: groupId },
      data: { remindersEnabled: enabled },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        groupId,
        method: 'UPDATE',
        entity: 'Group',
        entityId: groupId,
        diffJson: {
          action: 'toggle_reminders',
          enabled,
        },
      },
    })

    return {
      success: true,
      remindersEnabled: updated.remindersEnabled,
    }
  } catch (error) {
    console.error('Failed to toggle reminders:', error)
    return { error: 'Failed to toggle reminders' }
  }
}

/**
 * Delete a group (soft delete)
 * Only the owner can delete a group
 */
export async function deleteGroup(groupId: string) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Check if user is the owner
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        ownerId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            memberships: true,
            reminderRules: true,
          },
        },
      },
    })

    if (!group) {
      return { error: 'Group not found or you do not have permission' }
    }

    // Soft delete the group (this will cascade due to Prisma schema relations)
    await db.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    })

    // Create audit log for the deletion
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        groupId,
        method: 'DELETE',
        entity: 'Group',
        entityId: groupId,
        diffJson: {
          action: 'delete_group',
          groupName: group.name,
          memberCount: group._count.memberships,
          reminderRuleCount: group._count.reminderRules,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete group:', error)
    return { error: 'Failed to delete group' }
  }
}

