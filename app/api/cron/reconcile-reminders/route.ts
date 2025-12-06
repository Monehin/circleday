import { NextRequest, NextResponse } from 'next/server'
import { reconcileScheduledSends } from '@/lib/services/reminder-reconciliation'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Trigger reconciliation between ScheduledSend rows and Temporal workflows.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const { limit, windowHours } = Object.fromEntries(request.nextUrl.searchParams.entries())
    const result = await reconcileScheduledSends({
      limit: limit ? Number(limit) : undefined,
      windowHours: windowHours ? Number(windowHours) : undefined,
    })

    if (result.discrepancies.length > 0) {
      console.warn(
        `🛎️ Reconciliation detected ${result.discrepancies.length} discrepancy(ies) between ScheduledSend and Temporal workflows.`
      )
      result.discrepancies.forEach(d => {
        console.warn(
          `• ${d.type} for scheduledSendId=${d.scheduledSendId}, workflow=${d.idempotencyKey}: ${d.details}`
        )
      })
      const slackWebhook = process.env.REMINDER_RECONCILIATION_SLACK_WEBHOOK
      if (slackWebhook) {
        try {
          await fetch(slackWebhook, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: `Reminder reconciliation detected ${result.discrepancies.length} issue(s) between ScheduledSend and Temporal workflows (<${request.nextUrl.origin}/api/metrics/reminders/reconciliation|view latest>).`,
            }),
          })
          console.log('✅ Sent reconciliation Slack alert')
        } catch (error) {
          console.error('Failed to send reconciliation Slack alert:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reconciliation completed',
      ...result,
    })
  } catch (error) {
    console.error('Reconciliation job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

