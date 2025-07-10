export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface ErrorHandlerConfig {
  enableLogging?: boolean
  enableToasts?: boolean
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error, context?: ErrorContext) => void
}

export interface UseComprehensiveErrorHandlerReturn {
  error: Error | null
  isLoading: boolean
  retryCount: number
  clearError: () => void
  handleError: (error: Error, context?: ErrorContext) => void
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    config?: ErrorHandlerConfig,
  ) => Promise<T | null>
  retryLastOperation: () => Promise<void>
}
