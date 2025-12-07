import { NextRequest, NextResponse } from 'next/server'
import { alertLowInviteConversion } from '@/lib/services/invite-analytics-alerts'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const result = await alertLowInviteConversion()
  return NextResponse.json(result)
}

