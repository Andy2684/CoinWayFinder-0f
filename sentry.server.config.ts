import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",

  // Server-side performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Disable replay for server-side
  integrations: [new Sentry.NodeIntegration()],

  beforeSend(event, hint) {
    // Filter server-side errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip database connection errors that are handled
        if (error.message.includes("ECONNREFUSED") || error.message.includes("connection refused")) {
          return null
        }
      }
    }
    return event
  },
})
