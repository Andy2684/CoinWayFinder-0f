"use client"

import { useState, useCallback } from "react"

interface ErrorContext {
  userId?: string
  action?: string
  component?: string
  metadata?: Record<string, any>
}

interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
}

interface ErrorInfo {
  message: string
  stack?: string
  context: ErrorContext
  timestamp: number
  retryCount: number
}

export function useComprehensiveErrorHandler() {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const logError = useCallback((error: Error, context: ErrorContext = {}) => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      retryCount: 0,
    }

    setErrors((prev) => [...prev, errorInfo])

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error logged:", errorInfo)
    }
  }, [])

  const handleAsyncError = useCallback(
    async (
      asyncFn: () => Promise<any>,
      context: ErrorContext = {},
      options: ErrorHandlerOptions = {},
    ): Promise<any | null> => {
      const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        logToConsole = true,
        reportToService = false,
      } = options

      let lastError: Error | null = null

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setIsLoading(true)
          const result = await asyncFn()
          setIsLoading(false)
          return result
        } catch (error) {
          lastError = error as Error

          if (attempt < maxRetries) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
          }
        }
      }

      setIsLoading(false)

      if (lastError) {
        const errorInfo: ErrorInfo = {
          message: lastError.message,
          stack: lastError.stack,
          context,
          timestamp: Date.now(),
          retryCount: maxRetries,
        }

        setErrors((prev) => [...prev, errorInfo])

        if (logToConsole) {
          console.error("Async operation failed after retries:", errorInfo)
        }

        if (reportToService) {
          // Report to error tracking service
          try {
            await fetch("/api/error-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(errorInfo),
            })
          } catch (reportError) {
            console.error("Failed to report error:", reportError)
          }
        }
      }

      return null
    },
    [],
  )

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const removeError = useCallback((timestamp: number) => {
    setErrors((prev) => prev.filter((error) => error.timestamp !== timestamp))
  }, [])

  return {
    errors,
    isLoading,
    logError,
    handleAsyncError,
    clearErrors,
    removeError,
  }
}
