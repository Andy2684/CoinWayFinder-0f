"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface ComprehensiveErrorOptions {
  showToast?: boolean
  toastMessage?: string
  logError?: boolean
  reportError?: boolean
  retryable?: boolean
  maxRetries?: number
  onError?: (error: Error) => void
  onRetry?: (attempt: number) => void
}

export interface ComprehensiveErrorState {
  error: Error | null
  isLoading: boolean
  retryCount: number
  clearError: () => void
  handleAsyncOperation: <T>(operation: () => Promise<T>, options?: ComprehensiveErrorOptions) => Promise<T | null>
  retry: () => Promise<void>
}

export function useComprehensiveErrorHandler(): ComprehensiveErrorState {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastOperation, setLastOperation] = useState<{
    operation: () => Promise<any>
    options: ComprehensiveErrorOptions
  } | null>(null)

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setLastOperation(null)
  }, [])

  const reportError = useCallback(async (error: Error) => {
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }, [])

  const handleAsyncOperation = useCallback(async <T>(\
    operation: () => Promise<T>,\
    options: ComprehensiveErrorOptions = {}\
  ): Promise<T | null> => {\
  const maxRetries = options.maxRetries || 3

  setLastOperation({ operation, options })

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      setIsLoading(true)
      setError(null)

      if (attempt > 0 && options.onRetry) {
        options.onRetry(attempt)
      }

      const result = await operation()
      setRetryCount(0)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unknown error occurred")
      setError(error)
      setRetryCount(attempt + 1)

      if (options.logError !== false) {
        console.error(`Error in async operation (attempt ${attempt + 1}):`, error)
      }

      if (options.reportError && attempt === 0) {
        await reportError(error)
      }

      if (attempt === maxRetries) {
        if (options.showToast !== false) {
          toast.error(options.toastMessage || error.message)
        }

        if (options.onError) {
          options.onError(error)
        }

        return null
      }

      if (options.retryable !== false && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      } else {
        break
      }
    } finally {
      setIsLoading(false)
    }
  }

  return null
  \
}
, [reportError])

const retry = useCallback(async () => {
  if (lastOperation) {
    await handleAsyncOperation(lastOperation.operation, lastOperation.options)
  }
}, [lastOperation, handleAsyncOperation])

return {
    error,
    isLoading,
    retryCount,
    clearError,
    handleAsyncOperation,
    retry
  }
\
}
