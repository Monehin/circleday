'use server'

import { auth } from '@/lib/auth/config'
import { headers } from 'next/headers'
import { getTemporalClient } from '@/temporal/client'
import type { ReminderInput } from '@/temporal/workflows/reminder.workflow'

interface TestReminderInput {
  channels: ('EMAIL' | 'SMS')[]
  recipientEmail?: string
  recipientPhone?: string
}

export async function sendTestReminder(input: TestReminderInput) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Validate channels
    if (!input.channels || input.channels.length === 0) {
      return { error: 'At least one channel is required' }
    }

    if (input.channels.includes('EMAIL') && !input.recipientEmail) {
      return { error: 'Email is required when EMAIL channel is selected' }
    }

    if (input.channels.includes('SMS') && !input.recipientPhone) {
      return { error: 'Phone number is required when SMS channel is selected' }
    }

    // Check if Temporal is enabled
    const useTemporalEnabled = process.env.USE_TEMPORAL === 'true'
    if (!useTemporalEnabled) {
      return { 
        error: 'Temporal is not enabled. Set USE_TEMPORAL=true in your environment variables.' 
      }
    }

    // Prepare workflow input
    const workflowInput: ReminderInput = {
      eventId: `test-${Date.now()}`,
      eventName: '🧪 Test Reminder',
      eventDate: new Date(Date.now() + 5000), // 5 seconds from now
      recipientEmail: input.recipientEmail || session.user.email,
      recipientName: session.user.name || session.user.email.split('@')[0] || 'User',
      groupName: 'Test Group',
      daysBeforeEvent: 0,
      channels: input.channels,
    }
    
    // Add phone if provided
    if (input.recipientPhone) {
      workflowInput.recipientPhone = input.recipientPhone
    }

    // Connect to Temporal and start workflow
    const client = await getTemporalClient()
    
    const workflowId = `test-reminder-${session.user.id}-${Date.now()}`
    
    const handle = await client.workflow.start('reminderWorkflow', {
      taskQueue: 'circleday-tasks',
      workflowId,
      args: [workflowInput],
    })

    console.log('✅ Test reminder workflow started:', {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      channels: input.channels,
    })

    return {
      success: true,
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      message: 'Test reminder workflow started successfully',
    }
  } catch (error) {
    console.error('Failed to send test reminder:', error)
    
    if (error instanceof Error) {
      return { error: error.message }
    }
    
    return { error: 'Failed to send test reminder' }
  }
}

