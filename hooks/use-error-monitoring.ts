"use client"

import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

export function useErrorMonitoring() {
  const { toast } = useToast()

  const logError = useCallback(
    async (error: Error, context?: ErrorContext, showToast = true) => {
      try {
        // Log to our error tracking service
        await fetch("/api/errors/log", {
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
            context,
          }),
        })

        // Show user-friendly toast notification
        if (showToast) {
          const isNetworkError = error.message.includes("fetch") || error.message.includes("network")
          const isBotError = context?.component?.includes("bot") || error.message.includes("bot")

          toast({
            title: "Something went wrong",
            description: isNetworkError
              ? "Connection issue. Please check your internet and try again."
              : isBotError
                ? "Bot operation failed. Your funds are safe."
                : "An unexpected error occurred. Our team has been notified.",
            variant: "destructive",
          })
        }
      } catch (logError) {
        console.error("Failed to log error:", logError)
      }
    },
    [toast],
  )

  const handleAsyncError = useCallback(
    (asyncFn: () => Promise<any>, context?: ErrorContext) => {
      return async (...args: any[]) => {
        try {
          return await asyncFn()
        } catch (error) {
          await logError(error as Error, context)
          throw error // Re-throw so calling code can handle it
        }
      }
    },
    [logError],
  )

  return {
    logError,
    handleAsyncError,
  }
}
