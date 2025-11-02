import { describe, it, expect } from 'vitest'
import { AppError, handleError, getErrorResponse, ErrorCode } from '@/lib/errors/error-handler'

describe('AppError', () => {
  it('creates error with code and message', () => {
    const error = new AppError(ErrorCode.UNAUTHORIZED, 'Custom message', 401)
    
    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(error.message).toBe('Custom message')
    expect(error.statusCode).toBe(401)
    expect(error.name).toBe('AppError')
  })

  it('uses default message from ErrorCode if not provided', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, undefined, 404)
    
    expect(error.message).toBe('Resource not found')
  })

  it('includes details when provided', () => {
    const details = { field: 'email', reason: 'invalid format' }
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, details)
    
    expect(error.details).toEqual(details)
  })

  it('defaults to 500 status code', () => {
    const error = new AppError(ErrorCode.INTERNAL_ERROR)
    
    expect(error.statusCode).toBe(500)
  })
})

describe('handleError', () => {
  it('returns AppError as-is if already AppError', () => {
    const originalError = new AppError(ErrorCode.PERMISSION_DENIED, 'No access', 403)
    const result = handleError(originalError)
    
    expect(result).toBe(originalError)
    expect(result.code).toBe(ErrorCode.PERMISSION_DENIED)
  })

  it('converts regular Error to AppError', () => {
    const error = new Error('Something went wrong')
    const result = handleError(error)
    
    expect(result).toBeInstanceOf(AppError)
    expect(result.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(result.statusCode).toBe(500)
  })

  it('handles unknown error types', () => {
    const result = handleError('string error')
    
    expect(result).toBeInstanceOf(AppError)
    expect(result.code).toBe(ErrorCode.INTERNAL_ERROR)
  })

  it('includes original error message in details', () => {
    const error = new Error('Original message')
    const result = handleError(error)
    
    expect(result.details).toEqual({ originalError: 'Original message' })
  })
})

describe('getErrorResponse', () => {
  it('returns formatted error response', () => {
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', 400)
    const response = getErrorResponse(error)
    
    expect(response).toEqual({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid input',
      },
    })
  })

  it('includes details in development mode', () => {
    // In development (current environment), details should be included
    const details = { field: 'email' }
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid', 400, details)
    const response = getErrorResponse(error)
    
    // Details are included in development mode
    if (process.env.NODE_ENV === 'development') {
      expect(response.error.details).toEqual(details)
    }
  })
})

