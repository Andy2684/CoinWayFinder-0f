"use client"

import { useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { sentryService } from "@/lib/sentry"

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
  component?: string
  action?: string
  userId?: string
  additionalContext?: Record<string, any>
}

export const useErrorHandler = () => {
  const handleError = useCallback(async (error: Error, context?: string, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      logError = true,
      reportError = true,
      component,
      action,
      userId,
      additionalContext,
    } = options

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

    // Report error to Sentry
    if (reportError) {
      try {
        const sentryId = sentryService.captureException(error, {
          userId,
          component: component || context,
          action: action || "user-action",
          additionalData: {
            errorId,
            context,
            handledByHook: true,
            ...additionalContext,
          },
        })

        // Add breadcrumb for the handled error
        sentryService.addBreadcrumb(`Error handled in ${context || "unknown context"}`, "error-handling", {
          errorId,
          sentryId,
          component,
          action,
        })

        return { errorId, sentryId }
      } catch (reportError) {
        console.error("Failed to report error to Sentry:", reportError)
        return { errorId, sentryId: null }
      }
    }

    return { errorId, sentryId: null }
  }, [])

  const handleAPIError = useCallback(
    async (error: Error, endpoint: string, method: string, statusCode?: number, userId?: string) => {
      return handleError(error, `API ${method} ${endpoint}`, {
        component: "api-client",
        action: `${method.toLowerCase()}-request`,
        userId,
        additionalContext: {
          endpoint,
          method,
          statusCode,
        },
      })
    },
    [handleError],
  )

  const handleBotError = useCallback(
    async (error: Error, botId: string, strategy: string, userId?: string) => {
      return handleError(error, `Bot ${botId}`, {
        component: "trading-bot",
        action: "bot-operation",
        userId,
        additionalContext: {
          botId,
          strategy,
        },
      })
    },
    [handleError],
  )

  const handleTradeError = useCallback(
    async (error: Error, tradeId: string, symbol: string, side: string, userId?: string) => {
      return handleError(error, `Trade ${tradeId}`, {
        component: "trade-execution",
        action: "execute-trade",
        userId,
        additionalContext: {
          tradeId,
          symbol,
          side,
        },
      })
    },
    [handleError],
  )

  return {
    handleError,
    handleAPIError,
    handleBotError,
    handleTradeError,
  }
}
