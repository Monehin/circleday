import { NextRequest, NextResponse } from 'next/server'
import { reconcileScheduledSends } from '@/lib/services/reminder-reconciliation'

/**
 * Expose reconciliation status for dashboards/alerts.
 */
export async function GET(request: NextRequest) {
  try {
    const { limit, windowHours, groupId } = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    )
    const result = await reconcileScheduledSends({
      limit: limit ? Number(limit) : 20,
      windowHours: windowHours ? Number(windowHours) : 24,
      groupId,
    })

    return NextResponse.json({
      success: true,
      title: 'Temporal reconciliation',
      ...result,
    })
  } catch (error) {
    console.error('Failed to fetch reconciliation metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

