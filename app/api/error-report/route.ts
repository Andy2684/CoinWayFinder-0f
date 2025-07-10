import { type NextRequest, NextResponse } from "next/server"
import { sentryService } from "@/lib/sentry"

interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  component?: string
  context?: Record<string, any>
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
      })
    }

    // Create error object from report
    const error = new Error(errorReport.message)
    if (errorReport.stack) {
      error.stack = errorReport.stack
    }

    // Send to Sentry with full context
    const sentryId = sentryService.captureException(error, {
      userId: errorReport.userId,
      component: errorReport.component || "frontend",
      action: "client-error-report",
      additionalData: {
        errorId: errorReport.errorId,
        componentStack: errorReport.componentStack,
        userAgent: errorReport.userAgent,
        url: errorReport.url,
        timestamp: errorReport.timestamp,
        reportedViaAPI: true,
        ...errorReport.context,
      },
    })

    // Add breadcrumb for the error report
    sentryService.addBreadcrumb("Client error reported via API", "error-report", {
      errorId: errorReport.errorId,
      sentryId,
      component: errorReport.component,
      url: errorReport.url,
    })

    return NextResponse.json({
      success: true,
      message: "Error reported successfully",
      errorId: errorReport.errorId,
      sentryId,
    })
  } catch (error) {
    console.error("Failed to process error report:", error)

    // Report the error reporting failure to Sentry
    sentryService.captureException(error as Error, {
      component: "error-reporting-api",
      action: "process-error-report",
      additionalData: {
        originalErrorId: (error as any)?.errorId,
      },
    })

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process error report",
      },
      { status: 500 },
    )
  }
}
