export interface ErrorReport {
  message: string
  stack?: string
  context?: Record<string, any>
  severity: "low" | "medium" | "high" | "critical"
  userId?: string
  timestamp: string
}

export class ErrorReportingService {
  private apiEndpoint = "/api/error-report"

  async reportError(
    error: Error,
    options: {
      severity?: "low" | "medium" | "high" | "critical"
      context?: Record<string, any>
      userId?: string
    } = {},
  ): Promise<void> {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context: options.context,
      severity: options.severity || "medium",
      userId: options.userId,
      timestamp: new Date().toISOString(),
    }

    try {
      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      })
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }

  async reportCustomEvent(event: string, data: Record<string, any>): Promise<void> {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Failed to report custom event:", error)
    }
  }
}

export const errorReporting = new ErrorReportingService()
