/**
 * Temporal Worker
 * 
 * Long-running process that executes Temporal workflows and activities.
 * Should be deployed separately from the Next.js application.
 */

import 'dotenv/config'
import { NativeConnection, Worker } from '@temporalio/worker'
import * as activities from '../temporal/activities'
import path from 'path'

async function run() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233'
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default'
  const taskQueue = 'circleday-tasks'

  console.log('Starting CircleDay Temporal Worker')
  console.log(`Connecting to Temporal at ${temporalAddress}`)
  console.log(`Namespace: ${namespace}`)
  console.log(`Task Queue: ${taskQueue}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)

  try {
    // Connect to Temporal
    const connectionOptions: any = { address: temporalAddress }
    const serverName = temporalAddress.split(':')[0]

    // Temporal Cloud authentication
    if (process.env.TEMPORAL_CLOUD_ENABLED === 'true') {
      if (process.env.TEMPORAL_API_KEY) {
        // API Key authentication (simpler, recommended!)
        connectionOptions.apiKey = process.env.TEMPORAL_API_KEY
        // Ensure TLS is enabled when using API key with Temporal Cloud
        connectionOptions.tls = {
          ...(connectionOptions.tls ?? {}),
          serverNameOverride: serverName,
        }
      } else if (process.env.TEMPORAL_CLIENT_CERT && process.env.TEMPORAL_CLIENT_KEY) {
        // mTLS certificate authentication (alternative)
        connectionOptions.tls = {
          clientCertPair: {
            crt: Buffer.from(process.env.TEMPORAL_CLIENT_CERT, 'base64'),
            key: Buffer.from(process.env.TEMPORAL_CLIENT_KEY, 'base64'),
          },
        }
      } else {
        throw new Error(
          'Temporal Cloud requires either TEMPORAL_API_KEY or (TEMPORAL_CLIENT_CERT + TEMPORAL_CLIENT_KEY)'
        )
      }
    }

    const connection = await NativeConnection.connect(connectionOptions)
    
    console.log('✓ Connected to Temporal server')

    // Create worker
    const worker = await Worker.create({
      connection,
      namespace,
      taskQueue,
      workflowsPath: path.resolve(__dirname, '../temporal/workflows'),
      activities,
      maxConcurrentActivityTaskExecutions: 10,
      maxConcurrentWorkflowTaskExecutions: 10,
    })

    console.log('✓ Worker created')
    console.log(`✓ Workflows: ${path.resolve(__dirname, '../temporal/workflows')}`)
    console.log(`✓ Activities: ${Object.keys(activities).join(', ')}`)
    console.log('\nWorker is running. Press Ctrl+C to stop.\n')

    // Run worker
    await worker.run()

  } catch (error) {
    console.error('Failed to start worker:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down worker...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nShutting down worker...')
  process.exit(0)
})

// Start worker
run().catch((err) => {
  console.error('Worker crashed:', err)
  process.exit(1)
})
