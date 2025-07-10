import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["localhost", process.env.NEXT_PUBLIC_BASE_URL || ""],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

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
})
