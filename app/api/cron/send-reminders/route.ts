import { NextRequest, NextResponse } from 'next/server'
import { scheduleUpcomingReminders } from '@/lib/services/reminder-scheduler'

/**
 * Daily cron job to process and send reminders
 * 
 * This endpoint should be called once per day (e.g., at 9 AM UTC)
 * 
 * Two-phase process:
 * 1. Schedule upcoming reminders (creates ScheduledSend records for next 30 days)
 * 2. Process pending reminders for today (sends emails/SMS)
 * 
 * Security: In production, this should be secured with:
 * - A secret token in the Authorization header
 * 
 * Example cron schedule:
 * - URL: https://your-domain.com/api/cron/send-reminders
 * - Schedule: 0 9 * * * (every day at 9 AM UTC)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET

      if (!cronSecret) {
        console.error('CRON_SECRET not configured')
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        )
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('Invalid cron secret')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('🚀 Starting daily reminder scheduling...')

    console.log('📅 Scheduling upcoming reminders...')
    const scheduleResult = await scheduleUpcomingReminders()
    console.log(`✅ Scheduled ${scheduleResult.scheduled} reminders (${scheduleResult.skipped} skipped, ${scheduleResult.errors} errors)`)

    return NextResponse.json({
      success: true,
      message: 'Reminders scheduled successfully',
      scheduling: {
        scheduled: scheduleResult.scheduled,
        skipped: scheduleResult.skipped,
        errors: scheduleResult.errors,
      },
    })
  } catch (error) {
    console.error('Failed to process reminders:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing/monitoring (development only)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Method not allowed in production' },
      { status: 405 }
    )
  }

  try {
    console.log('📅 Scheduling upcoming reminders (dev mode)...')
    const scheduleResult = await scheduleUpcomingReminders()

    return NextResponse.json({
      success: true,
      message: 'Reminders scheduled successfully (dev mode)',
      scheduling: {
        scheduled: scheduleResult.scheduled,
        skipped: scheduleResult.skipped,
        errors: scheduleResult.errors,
      },
    })
  } catch (error) {
    console.error('Failed to process reminders:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

