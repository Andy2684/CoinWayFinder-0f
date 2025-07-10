"use client"

import { useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { captureError, addBreadcrumb, setUserContext } from "@/lib/sentry"

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
  context?: string
  userId?: string
  severity?: "low" | "medium" | "high" | "critical"
}

export const useErrorHandler = () => {
  const handleError = useCallback(async (error: Error, context?: string, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, logError = true, reportError = true, userId, severity = "medium" } = options

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Set user context if provided
    if (userId) {
      setUserContext({ id: userId })
    }

    // Add breadcrumb for context
    addBreadcrumb(`Error in ${context || "unknown context"}: ${error.message}`, "error", "error")

    // Log error to console
    if (logError) {
      console.error(`Error in ${context || "Unknown context"}:`, error)
    }

    // Show toast notification based on severity
    if (showToast) {
      const toastConfig = {
        low: {
          title: "Minor issue occurred",
          description: "A small issue was detected but shouldn't affect your experience.",
          variant: "default" as const,
        },
        medium: {
          title: "Something went wrong",
          description: context
            ? `Error in ${context}. Please try again.`
            : "An unexpected error occurred. Please try again.",
          variant: "destructive" as const,
        },
        high: {
          title: "Error occurred",
          description: context
            ? `Critical error in ${context}. Please refresh the page.`
            : "A critical error occurred. Please refresh the page.",
          variant: "destructive" as const,
        },
        critical: {
          title: "System Error",
          description: "A critical system error occurred. Please contact support if this persists.",
          variant: "destructive" as const,
        },
      }

      const config = toastConfig[severity]
      toast(config)
    }

    // Report error to Sentry with severity and context
    if (reportError) {
      captureError(error, {
        context,
        errorId,
        severity,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId,
        userAction: "error-handler",
      })
    }

    return errorId
  }, [])

  const handleAsyncError = useCallback(
    async (asyncOperation: () => Promise<any>, context?: string, options: ErrorHandlerOptions = {}) => {
      try {
        addBreadcrumb(`Starting async operation: ${context || "unknown"}`, "operation", "info")
        const result = await asyncOperation()
        addBreadcrumb(`Completed async operation: ${context || "unknown"}`, "operation", "info")
        return result
      } catch (error) {
        const errorToHandle = error instanceof Error ? error : new Error(String(error))
        await handleError(errorToHandle, context, {
          ...options,
          severity: options.severity || "high", // Async errors are typically more serious
        })
        throw error // Re-throw to allow calling code to handle it
      }
    },
    [handleError],
  )

  const handleNetworkError = useCallback(
    async (error: Error, endpoint?: string, options: ErrorHandlerOptions = {}) => {
      const context = endpoint ? `API call to ${endpoint}` : "Network request"
      return handleError(error, context, {
        ...options,
        severity: "medium", // Network errors are usually recoverable
      })
    },
    [handleError],
  )

  const handleCriticalError = useCallback(
    async (error: Error, context?: string, options: ErrorHandlerOptions = {}) => {
      return handleError(error, context, {
        ...options,
        severity: "critical",
        showToast: true, // Always show toast for critical errors
        reportError: true, // Always report critical errors
      })
    },
    [handleError],
  )

  return {
    handleError,
    handleAsyncError,
    handleNetworkError,
    handleCriticalError,
  }
}
