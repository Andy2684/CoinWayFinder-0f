"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

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
  logToConsole?: boolean
  reportToService?: boolean
}

export interface ErrorInfo {
  message: string
  stack?: string
  context: ErrorContext
  timestamp: Date
  retryCount: number
}

export interface UseComprehensiveErrorHandlerReturn {
  error: ErrorInfo | null
  isRetrying: boolean
  retryCount: number
  handleError: (error: Error, context?: ErrorContext, options?: ErrorHandlerOptions) => void
  handleAsyncError: <T>(asyncFn: () => Promise<T>, context?: ErrorContext, options?: ErrorHandlerOptions) => Promise<T>
  clearError: () => void
  retry: () => Promise<void>
}

export function useComprehensiveErrorHandler(): UseComprehensiveErrorHandlerReturn {
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastAsyncFn, setLastAsyncFn] = useState<(() => Promise<any>) | null>(null)
  const [lastContext, setLastContext] = useState<ErrorContext>({})
  const [lastOptions, setLastOptions] = useState<ErrorHandlerOptions>({})

  const reportError = useCallback(async (errorInfo: ErrorInfo) => {
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorInfo),
      })
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }, [])

  const handleError = useCallback(
    (error: Error, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
      const { showToast = true, logToConsole = true, reportToService = true } = options

      const errorInfo: ErrorInfo = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date(),
        retryCount,
      }

      setError(errorInfo)

      if (logToConsole) {
        console.error("Error handled:", errorInfo)
      }

      if (showToast) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }

      if (reportToService) {
        reportError(errorInfo)
      }
    },
    [retryCount, reportError],
  )

  const handleAsyncError = useCallback(async <T>(\
    asyncFn: () => Promise<T>,\
    context: ErrorContext = {},\
    options: ErrorHandlerOptions = {}\
  ): Promise<T> => {\
  const { maxRetries = 3, retryDelay = 1000, showToast = true, logToConsole = true, reportToService = true } = options

  setLastAsyncFn(() => asyncFn)
  setLastContext(context)
  setLastOptions(options)

  let currentRetryCount = 0

  while (currentRetryCount <= maxRetries) {
    try {
      setIsRetrying(currentRetryCount > 0)
      const result = await asyncFn()
      setError(null)
      setRetryCount(0)
      setIsRetrying(false)
      return result
    } catch (error) {
      currentRetryCount++
      setRetryCount(currentRetryCount)

      if (currentRetryCount > maxRetries) {
        const errorInfo: ErrorInfo = {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          context,
          timestamp: new Date(),
          retryCount: currentRetryCount - 1,
        }

        setError(errorInfo)
        setIsRetrying(false)

        if (logToConsole) {
          console.error("Async error after retries:", errorInfo)
        }

        if (showToast) {
          toast({
            title: "Error",
            description: `${errorInfo.message} (after ${currentRetryCount - 1} retries)`,
            variant: "destructive",
          })
        }

        if (reportToService) {
          reportError(errorInfo)
        }

        throw error
      }

      // Wait before retrying
      if (currentRetryCount <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetryCount))
      }
    }
  }

  throw new Error("Unexpected error in retry logic")
  \
}
, [reportError])

const clearError = useCallback(() => {
  setError(null)
  setRetryCount(0)
  setIsRetrying(false)
}, [])

const retry = useCallback(async () => {
  if (lastAsyncFn) {
    try {
      await handleAsyncError(lastAsyncFn, lastContext, lastOptions)
    } catch (error) {
      // Error is already handled in handleAsyncError
    }
  }
}, [lastAsyncFn, lastContext, lastOptions, handleAsyncError])

return {
    error,
    isRetrying,
    retryCount,
    handleError,
    handleAsyncError,
    clearError,
    retry,
  }
\
}
