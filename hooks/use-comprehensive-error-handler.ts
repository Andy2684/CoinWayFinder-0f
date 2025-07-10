"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"

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

export function useComprehensiveErrorHandler(
  defaultConfig: ErrorHandlerConfig = {},
): UseComprehensiveErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastOperation, setLastOperation] = useState<{
    operation: () => Promise<any>
    context?: ErrorContext
    config?: ErrorHandlerConfig
  } | null>(null)

  const config = {
    enableLogging: true,
    enableToasts: true,
    enableRetry: false,
    maxRetries: 3,
    retryDelay: 1000,
    ...defaultConfig,
  }

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setLastOperation(null)
  }, [])

  const handleError = useCallback(
    (error: Error, context?: ErrorContext) => {
      const errorWithContext = {
        ...error,
        context: {
          ...context,
          timestamp: new Date(),
          retryCount: retryCount,
        },
      }

      setError(errorWithContext)

      if (config.enableLogging) {
        console.error("Comprehensive Error Handler:", errorWithContext)
      }

      if (config.enableToasts) {
        toast.error(error.message || "An unexpected error occurred")
      }

      if (config.onError) {
        config.onError(error, context)
      }
    },
    [config, retryCount],
  )

  const executeWithErrorHandling = useCallback(async <T>(\
    operation: () => Promise<T>,\
    context?: ErrorContext,\
    operationConfig?: ErrorHandlerConfig\
  ): Promise<T | null> => {\
  const mergedConfig = { ...config, ...operationConfig }

  setIsLoading(true)
  setError(null)

  // Store operation for potential retry
  setLastOperation({ operation, context, config: operationConfig })

  try {
    const result = await operation()
    setRetryCount(0) // Reset retry count on success
    return result
  } catch (err) {
    const error = err instanceof Error ? err : new Error("An unknown error occurred")

    if (mergedConfig.enableRetry && retryCount < (mergedConfig.maxRetries || 3)) {
      setRetryCount((prev) => prev + 1)

      // Wait before retry
      if (mergedConfig.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, mergedConfig.retryDelay))
      }

      // Retry the operation
      return executeWithErrorHandling(operation, context, operationConfig)
    } else {
      handleError(error, context)
      return null
    }
  } finally {
    setIsLoading(false)
  }
  \
}
, [config, retryCount, handleError])

const retryLastOperation = useCallback(async () => {
  if (lastOperation) {
    await executeWithErrorHandling(lastOperation.operation, lastOperation.context, lastOperation.config)
  }
}, [lastOperation, executeWithErrorHandling])

// Auto-clear errors after a certain time
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => {
      clearError()
    }, 10000) // Clear error after 10 seconds

    return () => clearTimeout(timer)
  }
}, [error, clearError])

return {
    error,
    isLoading,
    retryCount,
    clearError,
    handleError,
    executeWithErrorHandling,
    retryLastOperation
  }
\
}
