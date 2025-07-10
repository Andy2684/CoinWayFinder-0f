import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://be9e7174e5ef1dfe96267f9229459d54@o4509641938698240.ingest.us.sentry.io/4509641948921856",
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["localhost", "coinwayfinder.vercel.app", /^\//],
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
        // Skip ResizeObserver errors (common browser quirk)
        if (error.message.includes("ResizeObserver loop limit exceeded")) {
          return null
        }
      }
    }
    return event
  },
})
