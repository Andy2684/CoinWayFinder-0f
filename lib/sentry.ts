import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

export const initSentry = () => {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      debug: process.env.NODE_ENV === "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      beforeSend(event, hint) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException
          if (error instanceof Error) {
            // Skip network errors that are not actionable
            if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
              return null
            }
            // Skip canceled requests
            if (error.message.includes("The operation was aborted")) {
              return null
            }
          }
        }
        return event
      },
      integrations: [
        new Sentry.BrowserTracing({
          // Performance monitoring
          tracingOrigins: ["localhost", process.env.NEXT_PUBLIC_BASE_URL || ""],
        }),
        new Sentry.Replay({
          // Session replay for debugging
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Session replay sample rate
      replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
    })
  }
}

export const captureError = (error: Error, context?: Record<string, any>) => {
  console.error("Error captured:", error)

  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        component: "frontend",
        environment: process.env.NODE_ENV,
      },
      extra: context,
    })
  }
}

export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>,
) => {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      tags: {
        component: "frontend",
        environment: process.env.NODE_ENV,
      },
      extra: context,
    })
  }
}

export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  if (SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  }
}

export const addBreadcrumb = (message: string, category: string, level: Sentry.SeverityLevel = "info") => {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    })
  }
}

export { Sentry }
