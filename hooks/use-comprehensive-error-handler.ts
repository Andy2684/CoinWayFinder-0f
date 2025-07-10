"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  reportError?: boolean
  fallbackValue?: any
  onError?: (error: Error, context: ErrorContext) => void
  onRetry?: (attempt: number, error: Error) => void
  onSuccess?: (result: any, attempts: number) => void
}

export interface ErrorInfo {
  id: string
  error: Error
  context: ErrorContext
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  resolved: boolean
  attempts: number
}

export interface RetryableOperation<T> {
  operation: () => Promise<T>
  context?: ErrorContext
  options?: ErrorHandlerOptions
}

export const useComprehensiveErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const errorQueue = useRef<ErrorInfo[]>([])
  const retryAttempts = useRef<Map<string, number>>(new Map())

  // Check if we're offline
  const checkOnlineStatus = useCallback(() => {
    setIsOffline(!navigator.onLine)
  }, [])

  // Add error to history
  const addError = useCallback(
    (error: Error, context: ErrorContext, severity: ErrorInfo["severity"] = "medium") => {
      const errorInfo: ErrorInfo = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        error,
        context,
        timestamp: new Date(),
        severity,
        resolved: false,
        attempts: 0,
      }

      setErrors((prev) => [errorInfo, ...prev.slice(0, 99)]) // Keep last 100 errors

      // Queue for offline reporting
      if (isOffline) {
        errorQueue.current.push(errorInfo)
      }

      return errorInfo.id
    },
    [isOffline],
  )

  // Mark error as resolved
  const resolveError = useCallback((errorId: string) => {
    setErrors((prev) => prev.map((error) => (error.id === errorId ? { ...error, resolved: true } : error)))
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([])
    retryAttempts.current.clear()
  }, [])

  // Get error statistics
  const getErrorStats = useCallback(() => {
    const total = errors.length
    const resolved = errors.filter((e) => e.resolved).length
    const unresolved = total - resolved
    const bySeverity = errors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total,
      resolved,
      unresolved,
      bySeverity,
    }
  }, [errors])

  // Sleep utility for retry delays
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Handle operation with comprehensive error handling
  const handleOperation = useCallback(
    async (operation, context = {}, options = {}) => {
      const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        reportError = true,
        fallbackValue,
        onError,
        onRetry,
        onSuccess,
      } = options

      const operationId = `${context.component || "unknown"}-${context.action || "operation"}`
      let lastError: Error
      let attempts = 0

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        attempts = attempt + 1

        try {
          const result = await operation()

          if (attempt > 0 && onSuccess) {
            onSuccess(result, attempts)
          }

          if (attempt > 0 && showToast) {
            toast.success(`Operation succeeded after ${attempts} attempts`)
          }

          return result
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))

          // Determine error severity
          let severity: ErrorInfo["severity"] = "medium"
          if (lastError.message.includes("network") || lastError.message.includes("fetch")) {
            severity = "high"
          }
          if (lastError.message.includes("critical") || lastError.message.includes("fatal")) {
            severity = "critical"
          }

          // Add to error history
          const errorId = addError(lastError, { ...context, operationId }, severity)

          // Call error callback
          if (onError) {
            onError(lastError, context)
          }

          // If this isn't the last attempt, retry
          if (attempt < maxRetries) {
            if (onRetry) {
              onRetry(attempt + 1, lastError)
            }

            if (showToast) {
              toast.error(`Attempt ${attempt + 1} failed. Retrying...`)
            }

            // Exponential backoff
            const delay = retryDelay * Math.pow(2, attempt)
            await sleep(delay)
            continue
          }

          // Final attempt failed
          if (showToast) {
            toast.error(`Operation failed after ${attempts} attempts: ${lastError.message}`)
          }

          // Report error if enabled
          if (reportError) {
            console.error(`[ErrorHandler] ${operationId} failed:`, {
              error: lastError,
              context,
              attempts,
            })
          }

          // Return fallback value if provided
          if (fallbackValue !== undefined) {
            return fallbackValue
          }

          // Re-throw the error
          throw lastError
        }
      }

      throw lastError!
    },
    [addError, isOffline],
  )

  // Handle operation with retry (alternative interface)
  const handleWithRetry = useCallback(
    async ({ operation, context = {}, options = {} }: RetryableOperation<any>) => {
      return handleOperation(operation, context, options)
    },
    [handleOperation],
  )

  // Handle async operation safely
  const safeAsync = useCallback(
    async (operation, fallback, context = {}) => {
      try {
        return await handleOperation(operation, context, {
          maxRetries: 1,
          showToast: false,
          fallbackValue: fallback,
        })
      } catch {
        return fallback
      }
    },
    [handleOperation],
  )

  // Handle sync operation safely
  const safeSync = useCallback(
    (operation, fallback, context = {}) => {
      try {
        return operation()
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        addError(err, context, "low")
        return fallback
      }
    },
    [addError],
  )

  return {
    // Error handling methods
    handleOperation,
    handleWithRetry,
    safeAsync,
    safeSync,

    // Error management
    addError,
    resolveError,
    clearErrors,

    // Error data
    errors,
    getErrorStats,

    // Network status
    isOffline,
    checkOnlineStatus,

    // Error queue for offline scenarios
    errorQueue: errorQueue.current,
  }
}

export default useComprehensiveErrorHandler
