import { type NextRequest, NextResponse } from "next/server"
import { Sentry } from "@/lib/sentry"

interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  context?: string
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json()

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Report:", {
        id: errorReport.errorId,
        message: errorReport.message,
        timestamp: errorReport.timestamp,
        url: errorReport.url,
        context: errorReport.context,
      })
    }

    // Send to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const eventId = Sentry.captureException(new Error(errorReport.message), {
        tags: {
          component: "api-error-report",
          errorId: errorReport.errorId,
          context: errorReport.context || "unknown",
        },
        extra: {
          stack: errorReport.stack,
          componentStack: errorReport.componentStack,
          userAgent: errorReport.userAgent,
          url: errorReport.url,
          timestamp: errorReport.timestamp,
        },
        user: errorReport.userId ? { id: errorReport.userId } : undefined,
      })

      // Add breadcrumb for tracking
      Sentry.addBreadcrumb({
        message: `Error reported: ${errorReport.message}`,
        category: "error-report",
        level: "error",
        data: {
          errorId: errorReport.errorId,
          context: errorReport.context,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Error reported successfully",
        errorId: errorReport.errorId,
        sentryEventId: eventId,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Error logged successfully",
      errorId: errorReport.errorId,
    })
  } catch (error) {
    console.error("Failed to process error report:", error)

    // Report the error reporting failure to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          component: "api-error-report",
          operation: "error-report-failure",
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process error report",
      },
      { status: 500 },
    )
  }
}
