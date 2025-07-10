"use client"

import { useState, useCallback, useRef } from "react"
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
  logToConsole?: boolean
  reportToService?: boolean
}

export interface ErrorInfo {
  message: string
  stack?: string
  code?: string
  timestamp: number
  context: ErrorContext
  retryCount: number
}

export interface ErrorHandlerState {
  errors: ErrorInfo[]
  isLoading: boolean
  lastError: ErrorInfo | null
}

export function useComprehensiveErrorHandler() {
  const [state, setState] = useState<ErrorHandlerState>({
    errors: [],
    isLoading: false,
    lastError: null,
  })

  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const logError = useCallback((error: ErrorInfo) => {
    console.error("Error Handler:", {
      message: error.message,
      stack: error.stack,
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString(),
    })
  }, [])

  const reportError = useCallback(async (error: ErrorInfo) => {
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(error),
      })
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }, [])

  const addError = useCallback((error: ErrorInfo) => {
    setState((prev) => ({
      ...prev,
      errors: [...prev.errors.slice(-9), error], // Keep last 10 errors
      lastError: error,
    }))
  }, [])

  const handleError = useCallback(
    async (operation: () => Promise<any>, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
      const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        logToConsole = true,
        reportToService = true,
      } = options

      let lastError: Error
      let retryCount = 0

      while (retryCount <= maxRetries) {
        try {
          setState((prev) => ({ ...prev, isLoading: true }))
          const result = await operation()
          setState((prev) => ({ ...prev, isLoading: false }))
          return result
        } catch (error) {
          lastError = error as Error
          retryCount++

          const errorInfo: ErrorInfo = {
            message: lastError.message,
            stack: lastError.stack,
            code: (lastError as any).code,
            timestamp: Date.now(),
            context: {
              ...context,
              retryAttempt: retryCount,
            },
            retryCount,
          }

          if (logToConsole) {
            logError(errorInfo)
          }

          if (reportToService && retryCount > maxRetries) {
            await reportError(errorInfo)
          }

          if (retryCount <= maxRetries) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount))
          } else {
            // Max retries exceeded
            addError(errorInfo)

            if (showToast) {
              toast.error(`Error: ${lastError.message}`, {
                description: context.action ? `Failed to ${context.action}` : undefined,
              })
            }

            setState((prev) => ({ ...prev, isLoading: false }))
            throw lastError
          }
        }
      }

      setState((prev) => ({ ...prev, isLoading: false }))
      throw lastError!
    },
    [logError, reportError, addError],
  )

  const handleAsyncError = useCallback(
    async (error: Error, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
      const { showToast = true, logToConsole = true, reportToService = true } = options

      const errorInfo: ErrorInfo = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        timestamp: Date.now(),
        context,
        retryCount: 0,
      }

      addError(errorInfo)

      if (logToConsole) {
        logError(errorInfo)
      }

      if (reportToService) {
        await reportError(errorInfo)
      }

      if (showToast) {
        toast.error(`Error: ${error.message}`, {
          description: context.action ? `Failed to ${context.action}` : undefined,
        })
      }
    },
    [addError, logError, reportError],
  )

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: [],
      lastError: null,
    }))
  }, [])

  const retryOperation = useCallback(
    async (operation: () => Promise<any>, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
      return handleError(operation, context, options)
    },
    [handleError],
  )

  return {
    ...state,
    handleError,
    handleAsyncError,
    clearErrors,
    retryOperation,
  }
}

export default useComprehensiveErrorHandler
