import { NextRequest, NextResponse } from 'next/server'
import { getGroupReminderHealth } from '@/lib/actions/reminder-health'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await context.params
  const result = await getGroupReminderHealth(groupId)
  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }
  return NextResponse.json(result)
}

