import 'dotenv/config';
import { getTemporalClient } from '../temporal/client';
import type { ReminderInput } from '../temporal/workflows/reminder.workflow';

async function test() {
  console.log('🧪 Testing Temporal Integration...\n');
  
  try {
    // 1. Connect to Temporal
    console.log('1️⃣ Connecting to Temporal server...');
    const client = await getTemporalClient();
    console.log('✅ Connected to Temporal!\n');
    
    // 2. Start a test workflow
    console.log('2️⃣ Starting test reminder workflow...');
    const input: ReminderInput = {
      eventId: 'test-event-' + Date.now(),
      eventName: "John's Birthday",
      eventDate: new Date(Date.now() + 10000), // 10 seconds from now
      recipientEmail: process.env.TEST_EMAIL || process.env.RESEND_FROM_EMAIL || 'test@example.com',
      recipientName: 'Test User',
      groupName: 'CircleDay Test',
      daysBeforeEvent: 0,
      channels: ['EMAIL'],
    };
    
    const handle = await client.workflow.start('reminderWorkflow', {
      taskQueue: 'circleday-tasks',
      workflowId: 'test-reminder-' + Date.now(),
      args: [input],
    });
    
    console.log('✅ Workflow started successfully!');
    console.log('   📋 Workflow ID:', handle.workflowId);
    console.log('   🔄 Run ID:', handle.firstExecutionRunId);
    console.log('\n3️⃣ Watch it live:');
    console.log('   👉 http://localhost:8080\n');
    
    console.log('⏳ Waiting for workflow to complete (10 seconds)...');
    const result = await handle.result();
    
    console.log('\n✅ Workflow completed successfully!');
    console.log('   📧 Result:', result);
    
    console.log('\n🎉 SUCCESS! Temporal integration is working perfectly!\n');
    console.log('Next steps:');
    console.log('  1. Check your email for the test reminder');
    console.log('  2. View workflow in Temporal UI: http://localhost:8080');
    console.log('  3. Ready to deploy to production! 🚀\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error testing Temporal integration:');
    console.error(error);
    console.log('\nTroubleshooting:');
    console.log('  1. Make sure Temporal server is running: npm run temporal:status');
    console.log('  2. Make sure worker is running: npm run temporal:worker');
    console.log('  3. Check .env.local has valid RESEND_API_KEY\n');
    process.exit(1);
  }
}

test();

