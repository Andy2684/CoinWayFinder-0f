import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://be9e7174e5ef1dfe96267f9229459d54@o4509641938698240.ingest.us.sentry.io/4509641948921856",
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
})
