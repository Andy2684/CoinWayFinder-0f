"use client"

import { useState, useCallback } from "react"
import { ErrorReportingService } from "@/lib/error-reporting"

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  enableReporting?: boolean
  severity?: "low" | "medium" | "high" | "critical"
}

export interface ErrorState {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
  isRetrying: boolean
}

const errorReporting = new ErrorReportingService()

export function useComprehensiveErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
    retryCount: 0,
    isRetrying: false,
  })

  const handleError = useCallback(
    async (error: Error, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
      const { maxRetries = 3, retryDelay = 1000, enableReporting = true, severity = "medium" } = options

      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      setErrorState((prev) => ({
        ...prev,
        hasError: true,
        error,
        errorId,
        retryCount: prev.retryCount + 1,
      }))

      // Report error if enabled
      if (enableReporting) {
        try {
          await errorReporting.reportError(error, {
            severity,
            context: {
              ...context,
              retryCount: errorState.retryCount,
              timestamp: new Date().toISOString(),
            },
            userId: context.userId,
          })
        } catch (reportingError) {
          console.warn("Failed to report error:", reportingError)
        }
      }

      // Log error to console in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error handled:", {
          error,
          context,
          errorId,
          retryCount: errorState.retryCount,
        })
      }
    },
    [errorState.retryCount],
  )

  const retryOperation = useCallback(
    async <T>(\
      operation: () => Promise<T>,\
      context: ErrorContext = {},\
      options: ErrorHandlerOptions = {}\
    ): Promise<T> => {\
  const { maxRetries = 3, retryDelay = 1000, enableReporting = true, severity = "medium" } = options

  let lastError: Error
  let retryCount = 0

  while (retryCount < maxRetries) {
    setErrorState((prev) => ({
      ...prev,
      isRetrying: retryCount > 0,
      retryCount,
    }))

    try {
      const result = await operation()
      // Clear error state on success
      setErrorState({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: 0,
        isRetrying: false,
      })
      return result
    } catch (error) {
      lastError = error as Error
      retryCount++
      if (retryCount < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount))
      }
    }
  }

  // All retries failed, handle the error
  await handleError(lastError!, context, { ...options, severity })
  throw lastError!
  \
}
,
    [handleError]
  )

const clearError = useCallback(() => {
  setErrorState({
    hasError: false,
    error: null,
    errorId: null,
    retryCount: 0,
    isRetrying: false,
  })
}, [])

const withErrorHandling = useCallback(
  <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {},
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args)
      } catch (error) {
        await handleError(error as Error, context, options)
        return null
      }
    }
  },
  [handleError],
)

const withRetry = useCallback(
  <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {},
  ) => {
    return async (...args: T): Promise<R> => {
      return retryOperation(() => fn(...args), context, options)
    }
  },
  [retryOperation],
)

return {
    errorState,
    handleError,
    retryOperation,
    clearError,
    withErrorHandling,
    withRetry,
  }
\
}

export default useComprehensiveErrorHandler
