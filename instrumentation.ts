export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}

export async function onRequestError(error: Error, request: Request) {
  // This function is called when an error occurs during request processing
  const { Sentry } = await import("./lib/sentry")

  Sentry.captureException(error, {
    tags: {
      component: "server",
      url: request.url,
      method: request.method,
    },
    extra: {
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString(),
    },
  })
}
