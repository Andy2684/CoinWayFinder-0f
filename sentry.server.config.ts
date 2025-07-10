import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://be9e7174e5ef1dfe96267f9229459d54@o4509641938698240.ingest.us.sentry.io/4509641948921856",
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",

  // Server-side performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Disable replay for server-side
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Express({ app: undefined })],

  beforeSend(event, hint) {
    // Filter server-side errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip database connection errors that are handled
        if (error.message.includes("ECONNREFUSED") || error.message.includes("connection refused")) {
          return null
        }
        // Skip MongoDB connection errors
        if (error.message.includes("MongoNetworkError") || error.message.includes("MongoTimeoutError")) {
          return null
        }
      }
    }
    return event
  },
})
