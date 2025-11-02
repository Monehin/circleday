export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_TIMEZONE = 'INVALID_TIMEZONE',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Not found
  NOT_FOUND = 'NOT_FOUND',
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
  CONTACT_NOT_FOUND = 'CONTACT_NOT_FOUND',
  
  // Business logic
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_STATE = 'INVALID_STATE',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // External service errors
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  SMS_SEND_FAILED = 'SMS_SEND_FAILED',
  STRIPE_ERROR = 'STRIPE_ERROR',
  TANGO_ERROR = 'TANGO_ERROR',
  QUEUE_ERROR = 'QUEUE_ERROR',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'You must be logged in to access this resource',
  [ErrorCode.INVALID_TOKEN]: 'Invalid or expired token',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input provided',
  [ErrorCode.INVALID_TIMEZONE]: 'Invalid timezone specified',
  [ErrorCode.INVALID_INPUT]: 'The provided input is invalid',
  
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.GROUP_NOT_FOUND]: 'Group not found',
  [ErrorCode.EVENT_NOT_FOUND]: 'Event not found',
  [ErrorCode.CONTACT_NOT_FOUND]: 'Contact not found',
  
  [ErrorCode.PERMISSION_DENIED]: 'You do not have permission to perform this action',
  [ErrorCode.INVALID_STATE]: 'Operation cannot be performed in current state',
  [ErrorCode.DUPLICATE_ENTRY]: 'This entry already exists',
  
  [ErrorCode.EMAIL_SEND_FAILED]: 'Failed to send email',
  [ErrorCode.SMS_SEND_FAILED]: 'Failed to send SMS',
  [ErrorCode.STRIPE_ERROR]: 'Payment processing error',
  [ErrorCode.TANGO_ERROR]: 'Gift card processing error',
  [ErrorCode.QUEUE_ERROR]: 'Job queue error',
  
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred',
  [ErrorCode.DATABASE_ERROR]: 'Database operation failed',
  [ErrorCode.NETWORK_ERROR]: 'Network request failed',
}

