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
}

export const useErrorHandler = () => {
  const handleError = useCallback(async (error: Error, context?: string, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, logError = true, reportError = true, userId } = options

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

    // Show toast notification
    if (showToast) {
      toast({
        title: "Something went wrong",
        description: context
          ? `Error in ${context}. Please try again.`
          : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    // Report error to Sentry
    if (reportError) {
      captureError(error, {
        context,
        errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId,
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
        await handleError(errorToHandle, context, options)
        throw error // Re-throw to allow calling code to handle it
      }
    },
    [handleError],
  )

  return { handleError, handleAsyncError }
}
