"use client"

import { useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
}

export const useErrorHandler = () => {
  const handleError = useCallback(async (error: Error, context?: string, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, logError = true, reportError = true } = options

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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

    // Report error to monitoring service
    if (reportError && process.env.NODE_ENV === "production") {
      try {
        await fetch("/api/error-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            errorId,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            context,
          }),
        })
      } catch (reportError) {
        console.error("Failed to report error:", reportError)
      }
    }

    return errorId
  }, [])

  return { handleError }
}
