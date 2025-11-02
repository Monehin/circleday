import { ErrorCode, ErrorMessages } from './error-types'

// Re-export ErrorCode for convenience
export { ErrorCode }

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message || ErrorMessages[code])
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleError(error: unknown): AppError {
  // If already an AppError, return as is
  if (error instanceof AppError) {
    return error
  }
  
  // Handle known error types
  if (error instanceof Error) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error)
    }
    
    // TODO: Send to Sentry in production
    // Sentry.captureException(error)
    
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      'An unexpected error occurred',
      500,
      { originalError: error.message }
    )
  }
  
  // Unknown error type
  return new AppError(ErrorCode.INTERNAL_ERROR, 'Unknown error occurred', 500)
}

export function getErrorResponse(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && error.details
        ? { details: error.details }
        : {}),
    },
  }
}

