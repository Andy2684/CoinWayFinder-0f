"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { captureError, addBreadcrumb, setUserContext } from "@/lib/sentry"

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
  severity?: "low" | "medium" | "high" | "critical"
  retryable?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface RetryableOperation<T> {
  operation: () => Promise<T>
  context: ErrorContext
  options?: ErrorHandlerOptions
}

export const useComprehensiveErrorHandler = () => {
    const [errorHistory, setErrorHistory] = useState<
      Array<{
        id: string
        error: Error
        context: ErrorContext
        timestamp: Date
        resolved: boolean
      }>
    >([])

    const retryAttempts = useRef<Map<string, number>>(new Map())

    const generateErrorId = useCallback(() => {
      return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }, [])

    const logErrorToHistory = useCallback((error: Error, context: ErrorContext, errorId: string) => {
      setErrorHistory((prev) => [
        ...prev.slice(-9),
        {
          id: errorId,
          error,
          context,
          timestamp: new Date(),
          resolved: false,
        },
      ])
    }, [])

    const markErrorAsResolved = useCallback((errorId: string) => {
      setErrorHistory((prev) => prev.map((item) => (item.id === errorId ? { ...item, resolved: true } : item)))
    }, [])

    const handleError = useCallback(
      async (error: Error, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
        const {
          showToast = true,
          logError = true,
          reportError = true,
          severity = "medium",
          retryable = false,
          maxRetries = 3,
          retryDelay = 1000,
        } = options

        const errorId = generateErrorId()

        // Set user context if provided
        if (context.userId) {
          setUserContext({ id: context.userId })
        }

        // Add breadcrumb for context
        addBreadcrumb(
          `Error in ${context.component || "unknown"}: ${error.message}`,
          "error",
          severity === "critical" ? "fatal" : "error",
        )

        // Log error to console
        if (logError) {
          console.error(`Error in ${context.component || "Unknown"}:`, {
            error,
            context,
            errorId,
            severity,
            timestamp: new Date().toISOString(),
          })
        }

        // Log to error history
        logErrorToHistory(error, context, errorId)

        // Show toast notification based on severity
        if (showToast) {
          const toastConfigs = {
            low: {
              title: "Minor issue",
              description: "A small issue was detected but shouldn't affect your experience.",
              variant: "default" as const,
            },
            medium: {
              title: "Something went wrong",
              description: context.component
                ? `Error in ${context.component}. Please try again.`
                : "An unexpected error occurred. Please try again.",
              variant: "destructive" as const,
            },
            high: {
              title: "Error occurred",
              description: context.component
                ? `Critical error in ${context.component}. Please refresh the page.`
                : "A critical error occurred. Please refresh the page.",
              variant: "destructive" as const,
            },
            critical: {
              title: "System Error",
              description: "A critical system error occurred. Please contact support if this persists.",
              variant: "destructive" as const,
            },
          }

          const config = toastConfigs[severity]
          toast({
            ...config,
            action: retryable
              ? {
                  altText: "Retry",
                  onClick: () => {
                    // This would be handled by the retry mechanism
                    console.log("Retry requested for error:", errorId)
                  },
                }
              : undefined,
          })
        }

        // Report error to Sentry with comprehensive context
        if (reportError) {
          captureError(error, {
            ...context,
            errorId,
            severity,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            url: typeof window !== "undefined" ? window.location.href : "unknown",
            retryable,
            maxRetries,
            currentRetries: retryAttempts.current.get(errorId) || 0,
          })
        }

        return errorId
      },
      [generateErrorId, logErrorToHistory],
    )

    const handleAsyncError = useCallback(async <T>(\
    asyncOperation: () => Promise<T>,\
    context: ErrorContext = {},\
    options: ErrorHandlerOptions = {}\
  ): Promise<T> => {\
    const operationId = `${context.component || "unknown"}_${context.action || "operation"}`

    try {
      addBreadcrumb(`Starting async operation: ${operationId}`, "operation", "info")
      const result = await asyncOperation()
      addBreadcrumb(`Completed async operation: ${operationId}`, "operation", "info")
      return result
    } catch (error) {
      const errorToHandle = error instanceof Error ? error : new Error(String(error))
      const errorId = await handleError(errorToHandle, context, {
        ...options,
        severity: options.severity || "high",
      })

      // Mark as resolved if operation eventually succeeds after retry
      if (options.retryable) {
        setTimeout(() => markErrorAsResolved(errorId), 5000)
      }

      throw error
    }
    \
  },
  [handleError, markErrorAsResolved]
)

const handleRetryableOperation = useCallback(async <T>({
    operation,
    context,
    options = {}\
  }: RetryableOperation<T>): Promise<T> => {\
const { maxRetries = 3, retryDelay = 1000 } = options
const operationKey = `${context.component}_${context.action}`
let lastError: Error

for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    if (attempt > 0) {
      addBreadcrumb(`Retry attempt ${attempt} for ${operationKey}`, "retry", "info")
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)))
    }

    const result = await operation()

    // Clear retry count on success
    retryAttempts.current.delete(operationKey)

    if (attempt > 0) {
      addBreadcrumb(`Operation succeeded after ${attempt} retries`, "retry", "info")
      toast({
        title: "Operation successful",
        description: `Completed after ${attempt} retry${attempt > 1 ? "ies" : ""}`,
        variant: "default",
      })
    }

    return result
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error))
    retryAttempts.current.set(operationKey, attempt + 1)

    if (attempt === maxRetries) {
      // Final attempt failed
      await handleError(lastError, context, {
        ...options,
        severity: "high",
        showToast: true,
      })
      break
    } else {
      // Intermediate failure
      addBreadcrumb(`Attempt ${attempt + 1} failed, retrying...`, "retry", "warning")
    }
  }
}

throw lastError!
\
  }, [handleError])

const handleNetworkError = useCallback(
  async (error: Error, endpoint?: string, options: ErrorHandlerOptions = {}) => {
    const context: ErrorContext = {
      component: "network",
      action: endpoint ? `request_to_${endpoint}` : "network_request",
      metadata: {
        endpoint,
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        timestamp: new Date().toISOString(),
      },
    }

    return handleError(error, context, {
      ...options,
      severity: "medium",
      retryable: true,
    })
  },
  [handleError],
)

const handleCriticalError = useCallback(
  async (error: Error, context: ErrorContext = {}, options: ErrorHandlerOptions = {}) => {
    return handleError(error, context, {
      ...options,
      severity: "critical",
      showToast: true,
      reportError: true,
      logError: true,
    })
  },
  [handleError],
)

const clearErrorHistory = useCallback(() => {
  setErrorHistory([])
  retryAttempts.current.clear()
}, [])

const getErrorStats = useCallback(() => {
  const total = errorHistory.length
  const resolved = errorHistory.filter((e) => e.resolved).length
  const byComponent = errorHistory.reduce(
    (acc, error) => {
      const component = error.context.component || "unknown"
      acc[component] = (acc[component] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    total,
    resolved,
    unresolved: total - resolved,
    byComponent,
    recentErrors: errorHistory.slice(-5),
  }
}, [errorHistory])

return {
    handleError,
    handleAsyncError,
    handleRetryableOperation,
    handleNetworkError,
    handleCriticalError,
    clearErrorHistory,
    getErrorStats,
    errorHistory,
  }
\
}
