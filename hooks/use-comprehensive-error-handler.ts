"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

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
  logToConsole?: boolean
  reportToService?: boolean
}

export interface ErrorReport {
  error: Error
  context: ErrorContext
  timestamp: Date
  userAgent: string
  url: string
  userId?: string
}

export interface UseErrorHandlerReturn {
  error: Error | null
  isLoading: boolean
  retry: () => void
  clearError: () => void
  handleError: (error: Error, context?: ErrorContext) => void
  executeWithErrorHandling: <T>(
    fn: () => Promise<T>,
    context?: ErrorContext,
    options?: ErrorHandlerOptions,
  ) => Promise<T | null>
}

export function useComprehensiveErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryFunction, setRetryFunction] = useState<(() => void) | null>(null)

  const reportError = useCallback(async (errorReport: ErrorReport) => {
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      })
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }, [])

  const handleError = useCallback(
    (error: Error, context: ErrorContext = {}) => {
      setError(error)

      const errorReport: ErrorReport = {
        error,
        context,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: context.userId,
      }

      // Log to console
      console.error("Error occurred:", {
        message: error.message,
        stack: error.stack,
        context,
      })

      // Report to error service
      reportError(errorReport)

      // Show toast notification
      toast({
        title: "An error occurred",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    },
    [reportError],
  )

  const executeWithErrorHandling = useCallback(async <T>(\
    fn: () => Promise<T>,\
    context: ErrorContext = {},\
    options: ErrorHandlerOptions = {}\
  ): Promise<T | null> => {\
  const { maxRetries = 3, retryDelay = 1000, showToast = true, logToConsole = true, reportToService = true } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      setIsLoading(true)
      setError(null)

      const result = await fn()
      setIsLoading(false)
      return result
    } catch (error) {
      lastError = error as Error

      if (logToConsole) {
        console.error(`Attempt ${attempt + 1} failed:`, error)
      }

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
      }
    }
  }

  // All retries failed
  setIsLoading(false)

  if (lastError) {
    const errorReport: ErrorReport = {
      error: lastError,
      context: {
        ...context,
        maxRetries,
        finalAttempt: true,
      },
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context.userId,
    }

    if (reportToService) {
      reportError(errorReport)
    }

    if (showToast) {
      toast({
        title: "Operation failed",
        description: `${lastError.message} (after ${maxRetries + 1} attempts)`,
        variant: "destructive",
      })
    }

    setError(lastError)
    setRetryFunction(() => () => executeWithErrorHandling(fn, context, options))
  }

  return null
  \
}
, [reportError])

const retry = useCallback(() => {
  if (retryFunction) {
    retryFunction()
  }
}, [retryFunction])

const clearError = useCallback(() => {
  setError(null)
  setRetryFunction(null)
}, [])

return {
    error,
    isLoading,
    retry,
    clearError,
    handleError,
    executeWithErrorHandling,
  }
\
}

// Utility function for handling async operations with error handling
export const withErrorHandling = async <T>(\
  fn: () => Promise<T>,\
  context?: ErrorContext,\
  options?: ErrorHandlerOptions\
)
: Promise<T | null> =>
{
  const { maxRetries = 3, retryDelay = 1000 } = options || {}

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
      }
    }
  }

  if (lastError) {
    const errorReport: ErrorReport = {
      error: lastError,
      context: context || {},
      timestamp: new Date(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      url: typeof window !== "undefined" ? window.location.href : "Server",
    }

    // Report error
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      })
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }

    throw lastError
  }

  return null
}
