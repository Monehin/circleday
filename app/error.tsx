'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Error boundary caught:', error)
    // TODO: Log to Sentry in production
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-depth-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-depth-600 mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-celebration-600 text-white rounded-lg hover:bg-celebration-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

