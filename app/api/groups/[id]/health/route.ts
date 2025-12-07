import { NextRequest, NextResponse } from 'next/server'
import { getGroupReminderHealth } from '@/lib/actions/reminder-health'
import { ensureGroupAccess } from '@/lib/actions/group-access'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await context.params
  const access = await ensureGroupAccess(groupId, request.headers)
  if (!access.success) {
    return NextResponse.json({ success: false, error: access.error }, { status: 401 })
  }
  try {
    const result = await getGroupReminderHealth(groupId, request.headers)
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error: any) {
    console.error('Health route error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

