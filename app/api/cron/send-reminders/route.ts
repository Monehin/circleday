import { NextRequest, NextResponse } from 'next/server'
import { processRemindersForToday } from '@/lib/services/reminder-sender'

/**
 * Daily cron job to process and send reminders
 * 
 * This endpoint should be called once per day (e.g., at 9 AM UTC)
 * 
 * Security: In production, this should be secured with:
 * - QStash signature verification, or
 * - A secret token in the Authorization header
 * 
 * Example QStash schedule:
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

    console.log('🚀 Starting daily reminder processing...')

    // Process all reminders for today
    const result = await processRemindersForToday()

    console.log('✅ Reminder processing complete:', result)

    return NextResponse.json({
      success: true,
      message: 'Reminders processed successfully',
      stats: {
        total: result.total,
        sent: result.sent,
        failed: result.failed,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
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
    // In development, allow GET for easy testing
    const result = await processRemindersForToday()

    return NextResponse.json({
      success: true,
      message: 'Reminders processed successfully (dev mode)',
      stats: {
        total: result.total,
        sent: result.sent,
        failed: result.failed,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
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

