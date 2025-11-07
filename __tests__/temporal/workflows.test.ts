/**
 * 🎓 LEARNING: Testing Temporal Workflows
 * 
 * Temporal provides excellent testing utilities!
 * 
 * KEY CONCEPTS:
 * - Use TestWorkflowEnvironment for isolated testing
 * - Mock activities easily
 * - Test time manipulation (skip hours/days instantly!)
 * - Test signals and queries
 * 
 * WHAT YOU'LL LEARN:
 * - How to test workflows in isolation
 * - How to mock activities
 * - How to test time-based workflows
 * - How to test signals/queries
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TestWorkflowEnvironment } from '@temporalio/testing'
import { Worker } from '@temporalio/worker'
import { reminderWorkflow } from '@/temporal/workflows/reminder.workflow'
import type { ReminderInput, WorkflowStatus } from '@/temporal/workflows/reminder.workflow'

/**
 * 🎯 Test Setup
 * 
 * Create a test environment that:
 * - Runs workflows in-memory (fast!)
 * - Allows time manipulation
 * - Doesn't need a Temporal server
 */
describe('Temporal Workflows', () => {
  let testEnv: TestWorkflowEnvironment

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal()
  })

  afterAll(async () => {
    await testEnv?.teardown()
  })


  /**
   * 🎓 TEST 2: Time-Based Workflows
   * 
   * Learn: How to test workflows that sleep/wait
   */
  describe('Reminder Workflow', () => {
    it('should send reminder at the right time', async () => {
      const { client, nativeConnection } = testEnv

      // Track what was sent
      const sentReminders: string[] = []

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: 'test-queue',
        workflowsPath: require.resolve('@/temporal/workflows/reminder.workflow'),
        activities: {
          validateEventData: async () => {},
          sendReminderEmail: async (params: any) => {
            sentReminders.push(`EMAIL:${params.recipientName}`)
            return 'test-email-id'
          },
          sendReminderSMS: async (params: any) => {
            sentReminders.push(`SMS:${params.recipientName}`)
            return 'test-sms-id'
          },
          logReminderSent: async () => {},
        },
      })

      const workerPromise = worker.run()

      try {
        // Create a reminder for 5 seconds in the future
        const input: ReminderInput = {
          eventId: 'test-event',
          eventName: 'Birthday',
          eventDate: new Date(Date.now() + 5000), // 5 seconds
          recipientEmail: 'test@example.com',
          recipientName: 'Test User',
          groupName: 'Test Group',
          daysBeforeEvent: 0,
          channels: ['EMAIL'],
        }

        const handle = await client.workflow.start(reminderWorkflow, {
          taskQueue: 'test-queue',
          workflowId: 'test-reminder-1',
          args: [input],
        })

        // ⏭️ MAGIC: Skip time forward!
        // No need to wait 5 actual seconds!
        await testEnv.sleep(6000)

        const result = await handle.result()

        expect(result).toContain('EMAIL_SENT')
        expect(sentReminders).toContain('EMAIL:Test User')

      } finally {
        worker.shutdown()
        await workerPromise
      }
    })

    /**
     * 🎓 TEST 3: Testing Signals
     * 
     * Learn: How to test workflow pause/resume
     */
    it('should pause and resume reminder', async () => {
      const { client, nativeConnection } = testEnv

      let emailSent = false

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: 'test-queue',
        workflowsPath: require.resolve('@/temporal/workflows/reminder.workflow'),
        activities: {
          validateEventData: async () => {},
          sendReminderEmail: async () => {
            emailSent = true
            return 'test-id'
          },
          sendReminderSMS: async () => 'test-id',
          logReminderSent: async () => {},
        },
      })

      const workerPromise = worker.run()

      try {
        const input: ReminderInput = {
          eventId: 'test-event',
          eventName: 'Birthday',
          eventDate: new Date(Date.now() + 10000), // 10 seconds
          recipientEmail: 'test@example.com',
          recipientName: 'Test User',
          groupName: 'Test Group',
          daysBeforeEvent: 0,
          channels: ['EMAIL'],
        }

        const handle = await client.workflow.start(reminderWorkflow, {
          taskQueue: 'test-queue',
          workflowId: 'test-reminder-pause',
          args: [input],
        })

        // Sleep 2 seconds
        await testEnv.sleep(2000)

        // Pause the workflow
        await handle.signal('pause')

        // Query status
        const pausedStatus = await handle.query('status') as WorkflowStatus
        expect(pausedStatus.isPaused).toBe(true)

        // Sleep 5 more seconds (should still be paused)
        await testEnv.sleep(5000)
        expect(emailSent).toBe(false) // Not sent yet!

        // Resume
        await handle.signal('resume')

        const resumedStatus = await handle.query('status') as WorkflowStatus
        expect(resumedStatus.isPaused).toBe(false)

        // Sleep until completion
        await testEnv.sleep(5000)

        const result = await handle.result()
        expect(result).toContain('EMAIL_SENT')
        expect(emailSent).toBe(true)

      } finally {
        worker.shutdown()
        await workerPromise
      }
    })

    /**
     * 🎓 TEST 4: Testing Cancellation
     * 
     * Learn: How to test workflow cancellation
     */
    it('should cancel reminder', async () => {
      const { client, nativeConnection } = testEnv

      let emailSent = false

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: 'test-queue',
        workflowsPath: require.resolve('@/temporal/workflows/reminder.workflow'),
        activities: {
          validateEventData: async () => {},
          sendReminderEmail: async () => {
            emailSent = true
            return 'test-id'
          },
          sendReminderSMS: async () => 'test-id',
          logReminderSent: async () => {},
        },
      })

      const workerPromise = worker.run()

      try {
        const input: ReminderInput = {
          eventId: 'test-event',
          eventName: 'Birthday',
          eventDate: new Date(Date.now() + 10000),
          recipientEmail: 'test@example.com',
          recipientName: 'Test User',
          groupName: 'Test Group',
          daysBeforeEvent: 0,
          channels: ['EMAIL'],
        }

        const handle = await client.workflow.start(reminderWorkflow, {
          taskQueue: 'test-queue',
          workflowId: 'test-reminder-cancel',
          args: [input],
        })

        // Sleep a bit
        await testEnv.sleep(2000)

        // Cancel the workflow
        await handle.signal('cancel')

        // Sleep until it would have sent
        await testEnv.sleep(10000)

        const result = await handle.result()
        expect(result).toBe('CANCELED')
        expect(emailSent).toBe(false) // Should NOT be sent

      } finally {
        worker.shutdown()
        await workerPromise
      }
    })
  })
})

/**
 * 🎓 LEARNING QUESTIONS:
 * 
 * Q1: Why use TestWorkflowEnvironment?
 * A: It's fast, isolated, and doesn't need a Temporal server running!
 * 
 * Q2: How does testEnv.sleep() work?
 * A: It skips time forward instantly - no real waiting!
 * 
 * Q3: Should I mock all activities in tests?
 * A: For unit tests, yes. For integration tests, use real activities.
 * 
 * Q4: Can I test activity failures?
 * A: Yes! Make your mock activity throw an error.
 * 
 * Q5: What about testing in CI?
 * A: These tests run without Docker - perfect for CI!
 */

/**
 * 🚀 RUNNING TESTS:
 * 
 *   npm test -- workflows
 * 
 * Or with coverage:
 * 
 *   npm run test:coverage -- workflows
 */

