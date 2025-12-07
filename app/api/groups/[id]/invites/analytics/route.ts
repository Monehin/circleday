import { NextRequest, NextResponse } from 'next/server'
import { getGroupInviteAnalytics } from '@/lib/actions/invite-analytics'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await context.params
  const result = await getGroupInviteAnalytics(groupId)
  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }
  return NextResponse.json(result)
}

