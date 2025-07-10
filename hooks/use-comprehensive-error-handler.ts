"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import * as Sentry from "@sentry/nextjs"

export interface ErrorContext {
  userId?: string
  action?: string
  component?: string
  metadata?: Record<string, any>
}

export interface ErrorHandlerOptions {
  showToast?: boolean
  toastMessage?: string
  logError?: boolean
  retryCount?: number
  context?: ErrorContext
  reportToSentry?: boolean
}

export interface UseComprehensiveErrorHandlerReturn {
  error: Error | null
  isLoading: boolean
  retryCount: number
  handleAsyncOperation: <T>(operation: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>
  handleError: (error: Error, options?: ErrorHandlerOptions) => void
  clearError: () => void
  retry: () => void
}

export function useComprehensiveErrorHandler(): UseComprehensiveErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastOperation, setLastOperation] = useState<(() => Promise<any>) | null>(null)
  const [lastOptions, setLastOptions] = useState<ErrorHandlerOptions>({})

  const handleError = useCallback(
    (error: Error, options: ErrorHandlerOptions = {}) => {
      setError(error)

      if (options.logError !== false) {
        console.error("Error occurred:", error, options.context)
      }

      if (options.reportToSentry !== false) {
        Sentry.captureException(error, {
          contexts: {
            errorHandler: {
              context: options.context,
              retryCount,
            },
          },
        })
      }

      if (options.showToast !== false) {
        toast.error(options.toastMessage || error.message)
      }
    },
    [retryCount],
  )

  const handleAsyncOperation = useCallback(async <T>(\
    operation: () => Promise<T>,\
    options: ErrorHandlerOptions = {}\
  ): Promise<T | null> => {\
  try {
    setIsLoading(true)
    setError(null)
    setLastOperation(() => operation)
    setLastOptions(options)

    const result = await operation()
    setRetryCount(0)
    return result
  } catch (err) {
    const error = err instanceof Error ? err : new Error("An unknown error occurred")
    setRetryCount((prev) => prev + 1)
    handleError(error, options)
    return null
  } finally {
    setIsLoading(false)
  }
  \
}
, [handleError])

const retry = useCallback(() => {
  if (lastOperation && retryCount < (lastOptions.retryCount || 3)) {
    handleAsyncOperation(lastOperation, lastOptions)
  }
}, [lastOperation, lastOptions, retryCount, handleAsyncOperation])

const clearError = useCallback(() => {
  setError(null)
  setRetryCount(0)
}, [])

return {
    error,
    isLoading,
    retryCount,
    handleAsyncOperation,
    handleError,
    clearError,
    retry
  }
\
}
