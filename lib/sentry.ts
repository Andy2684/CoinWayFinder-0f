import * as Sentry from "@sentry/nextjs"

export interface ErrorContext {
  userId?: string
  userEmail?: string
  component?: string
  action?: string
  botId?: string
  tradeId?: string
  exchangeId?: string
  additionalData?: Record<string, any>
}

export interface PerformanceContext {
  operation: string
  component?: string
  userId?: string
  duration?: number
  additionalData?: Record<string, any>
}

class SentryService {
  /**
   * Capture an exception with context
   */
  captureException(error: Error, context?: ErrorContext) {
    return Sentry.withScope((scope) => {
      if (context) {
        // Set user context
        if (context.userId || context.userEmail) {
          scope.setUser({
            id: context.userId,
            email: context.userEmail,
          })
        }

        // Set tags for filtering
        if (context.component) scope.setTag("component", context.component)
        if (context.action) scope.setTag("action", context.action)
        if (context.botId) scope.setTag("botId", context.botId)
        if (context.tradeId) scope.setTag("tradeId", context.tradeId)
        if (context.exchangeId) scope.setTag("exchangeId", context.exchangeId)

        // Set additional context
        if (context.additionalData) {
          scope.setContext("additional", context.additionalData)
        }
      }

      return Sentry.captureException(error)
    })
  }

  /**
   * Capture a message with context
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: ErrorContext) {
    return Sentry.withScope((scope) => {
      if (context) {
        if (context.userId || context.userEmail) {
          scope.setUser({
            id: context.userId,
            email: context.userEmail,
          })
        }

        if (context.component) scope.setTag("component", context.component)
        if (context.action) scope.setTag("action", context.action)
        if (context.additionalData) {
          scope.setContext("additional", context.additionalData)
        }
      }

      scope.setLevel(level)
      return Sentry.captureMessage(message)
    })
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, operation: string, context?: PerformanceContext) {
    const transaction = Sentry.startTransaction({
      name,
      op: operation,
      tags: {
        component: context?.component,
        userId: context?.userId,
        ...context?.additionalData,
      },
    })

    return transaction
  }

  /**
   * Capture performance metrics
   */
  capturePerformance(context: PerformanceContext) {
    Sentry.addBreadcrumb({
      message: `Performance: ${context.operation}`,
      category: "performance",
      level: "info",
      data: {
        component: context.component,
        duration: context.duration,
        ...context.additionalData,
      },
    })
  }

  /**
   * Set user context globally
   */
  setUser(user: { id?: string; email?: string; username?: string }) {
    Sentry.setUser(user)
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: "info",
      data,
    })
  }

  /**
   * Capture trading bot errors
   */
  captureBotError(error: Error, botId: string, strategy: string, additionalContext?: Record<string, any>) {
    return this.captureException(error, {
      component: "trading-bot",
      action: "bot-execution",
      botId,
      additionalData: {
        strategy,
        ...additionalContext,
      },
    })
  }

  /**
   * Capture API errors
   */
  captureAPIError(error: Error, endpoint: string, method: string, statusCode?: number, userId?: string) {
    return this.captureException(error, {
      component: "api",
      action: `${method} ${endpoint}`,
      userId,
      additionalData: {
        endpoint,
        method,
        statusCode,
      },
    })
  }

  /**
   * Capture exchange integration errors
   */
  captureExchangeError(error: Error, exchangeId: string, operation: string, userId?: string) {
    return this.captureException(error, {
      component: "exchange-integration",
      action: operation,
      exchangeId,
      userId,
      additionalData: {
        exchange: exchangeId,
        operation,
      },
    })
  }

  /**
   * Capture trade execution errors
   */
  captureTradeError(error: Error, tradeId: string, symbol: string, side: string, userId?: string) {
    return this.captureException(error, {
      component: "trade-execution",
      action: "execute-trade",
      tradeId,
      userId,
      additionalData: {
        symbol,
        side,
        tradeId,
      },
    })
  }
}

export const sentryService = new SentryService()

// Export commonly used functions
export const {
  captureException,
  captureMessage,
  startTransaction,
  capturePerformance,
  setUser,
  addBreadcrumb,
  captureBotError,
  captureAPIError,
  captureExchangeError,
  captureTradeError,
} = sentryService
