import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  integrations: [Sentry.nodeProfilingIntegration()],

  // Configure error filtering for server
  beforeSend(event, hint) {
    const error = hint.originalException

    if (error && typeof error === "object" && "message" in error) {
      const message = error.message

      // Filter out expected API errors
      if (message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT")) {
        return null
      }
    }

    return event
  },

  initialScope: {
    tags: {
      component: "coinwayfinder-backend",
    },
  },
})
