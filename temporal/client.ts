/**
 * Temporal Client
 * 
 * Client for starting and interacting with Temporal workflows from Next.js.
 * Automatically handles connection to local Docker or Temporal Cloud based on environment.
 */

import { Client, Connection } from '@temporalio/client'

// Singleton client instance
let client: Client | null = null

/**
 * Get connection configuration based on environment
 */
const getConnectionOptions = () => {
  const useTemporalCloud = process.env.TEMPORAL_CLOUD_ENABLED === 'true'

  if (useTemporalCloud) {
    if (!process.env.TEMPORAL_ADDRESS) {
      throw new Error('TEMPORAL_ADDRESS is required for Temporal Cloud')
    }

    // Support both API Key and mTLS authentication
    if (process.env.TEMPORAL_API_KEY) {
      // API Key authentication (simpler, recommended!)
      return {
        address: process.env.TEMPORAL_ADDRESS,
        apiKey: process.env.TEMPORAL_API_KEY,
      }
    } else if (process.env.TEMPORAL_CLIENT_CERT && process.env.TEMPORAL_CLIENT_KEY) {
      // mTLS certificate authentication (alternative method)
      return {
        address: process.env.TEMPORAL_ADDRESS,
        tls: {
          clientCertPair: {
            crt: Buffer.from(process.env.TEMPORAL_CLIENT_CERT, 'base64'),
            key: Buffer.from(process.env.TEMPORAL_CLIENT_KEY, 'base64'),
          },
        },
      }
    } else {
      throw new Error(
        'Temporal Cloud requires either TEMPORAL_API_KEY or (TEMPORAL_CLIENT_CERT + TEMPORAL_CLIENT_KEY)'
      )
    }
  }

  // Local development
  return {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  }
}

/**
 * Get Temporal Client (singleton)
 * 
 * Use this from Next.js server actions or API routes to start workflows.
 */
export async function getTemporalClient(): Promise<Client> {
  if (client) {
    return client
  }

  try {
    const connectionOptions = getConnectionOptions()
    const connection = await Connection.connect(connectionOptions)
    
    client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    })

    console.log('Temporal client connected')
    return client
  } catch (error) {
    console.error('Failed to connect to Temporal:', error)
    throw error
  }
}

/**
 * Helper to start a workflow
 * 
 * @example
 * ```typescript
 * const handle = await startWorkflow('reminderWorkflow', {
 *   workflowId: 'reminder-event-123',
 *   args: [reminderInput],
 * })
 * ```
 */
export async function startWorkflow<T = any>(
  workflowType: string,
  options: {
    workflowId: string
    taskQueue?: string
    args?: any[]
  }
) {
  const client = await getTemporalClient()

  const handle = await client.workflow.start(workflowType, {
    workflowId: options.workflowId,
    taskQueue: options.taskQueue || 'circleday-tasks',
    args: options.args || [],
  })

  return handle
}

/**
 * Get a handle to a running workflow for querying or signaling
 */
export async function getWorkflowHandle(workflowId: string) {
  const client = await getTemporalClient()
  return client.workflow.getHandle(workflowId)
}
