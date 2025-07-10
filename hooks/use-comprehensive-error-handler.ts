"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

export interface ErrorContext {
  userId?: string
  action?: string
  component?: string
  metadata?: Record<string, any>
}

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  logError?: boolean
  fallbackValue?: any
}

export interface ErrorState {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
}

export interface ErrorHandlerReturn {
  errorState: ErrorState
  handleError: (error: Error, context?: ErrorContext) => void
  retryOperation: () => void
  clearError: () => void
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    options?: ErrorHandlerOptions,
  ) => Promise<T | null>
}

export function useComprehensiveErrorHandler(): ErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
    retryCount: 0,
  })

  const [lastOperation, setLastOperation] = useState<{
    operation: () => Promise<any>
    context?: ErrorContext
    options?: ErrorHandlerOptions
  } | null>(null)

  const generateErrorId = useCallback((): string => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const logError = useCallback(async (error: Error, context: ErrorContext = {}, errorId: string): Promise<void> => {
    try {
      const errorData = {
        errorId,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        context,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
        url: typeof window !== "undefined" ? window.location.href : "server",
      }

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error logged:", errorData)
      }

      // Send to error reporting service
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorData),
      }).catch((reportingError) => {
        console.error("Failed to report error:", reportingError)
      })
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError)
    }
  }, [])

  const handleError = useCallback(
    (error: Error, context: ErrorContext = {}): void => {
      const errorId = generateErrorId()

      setErrorState((prev) => ({
        hasError: true,
        error,
        errorId,
        retryCount: prev.retryCount,
      }))

      // Log the error
      logError(error, context, errorId)

      // Show toast notification
      toast.error(`An error occurred: ${error.message}`, {
        description: `Error ID: ${errorId}`,
        action: {
          label: "Retry",
          onClick: () => retryOperation(),
        },
      })
    },
    [generateErrorId, logError],
  )

  const clearError = useCallback((): void => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    })
    setLastOperation(null)
  }, [])

  const retryOperation = useCallback(async (): Promise<void> => {
    if (!lastOperation) return

    const { operation, context, options } = lastOperation
    const maxRetries = options?.maxRetries || 3

    if (errorState.retryCount >= maxRetries) {
      toast.error("Maximum retry attempts reached")
      return
    }

    setErrorState((prev) => ({
      ...prev,
      retryCount: prev.retryCount + 1,
    }))

    try {
      const retryDelay = options?.retryDelay || 1000
      await new Promise((resolve) => setTimeout(resolve, retryDelay * errorState.retryCount))

      await operation()
      clearError()
      toast.success("Operation completed successfully")
    } catch (error) {
      handleError(error as Error, context)
    }
  }, [lastOperation, errorState.retryCount, handleError, clearError])

  const executeWithErrorHandling = useCallback(async <T>(\
    operation: () => Promise<T>,\
    context: ErrorContext = {},\
    options: ErrorHandlerOptions = {}\
  ): Promise<T | null> => {\
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    logError: shouldLogError = true,
    fallbackValue = null,
  } = options

  // Store operation for potential retry
  setLastOperation({ operation, context, options })

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()

      // Clear any previous errors on success
      if (errorState.hasError) {
        clearError()
      }

      return result
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        // Final attempt failed
        const errorId = generateErrorId()

        setErrorState({
          hasError: true,
          error: lastError,
          errorId,
          retryCount: attempt,
        })

        if (shouldLogError) {
          await logError(lastError, context, errorId)
        }

        if (showToast) {
          toast.error(`Operation failed: ${lastError.message}`, {
            description: `Error ID: ${errorId}`,
            action: {
              label: "Retry",
              onClick: () => retryOperation(),
            },
          })
        }

        return fallbackValue
      }

      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => 
            setTimeout(resolve, retryDelay * (attempt + 1))
          )
      }
    }
  }

  return fallbackValue
  \
}
, [errorState.hasError, generateErrorId, logError, clearError, retryOperation])

return {
    errorState,
    handleError,
    retryOperation,
    clearError,
    executeWithErrorHandling
  };
\
}

export default useComprehensiveErrorHandler
