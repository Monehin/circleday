import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

type GroupAccessSuccess = {
  success: true
  membership: Awaited<ReturnType<typeof db.membership.findFirst>>
  group: Awaited<ReturnType<typeof db.group.findUnique>>
}

type GroupAccessFailure = {
  success: false
  error: string
}

export type GroupAccessResult = GroupAccessSuccess | GroupAccessFailure

export async function ensureGroupAccess(
  groupId: string,
  incomingHeaders?: Headers
): Promise<GroupAccessResult> {
  const headerSource = incomingHeaders ?? (await headers())

  const session = await auth.api.getSession({
    headers: headerSource,
  })

  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  const membership = await db.membership.findFirst({
    where: {
      groupId,
      userId: session.user.id,
      status: 'ACTIVE',
    },
  })

  if (!membership) {
    return { success: false, error: 'You are not a member of this group' }
  }

  const group = await db.group.findUnique({
    where: { id: groupId },
  })

  return { success: true, membership, group }
}

