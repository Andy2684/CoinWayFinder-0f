import { Sentry } from "./sentry"

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
  severity: "low" | "medium" | "high" | "critical"
  metadata?: Record<string, any>
}

interface ErrorReportingConfig {
  enableConsoleLogging: boolean
  enableSentryReporting: boolean
  enableLocalStorage: boolean
  maxLocalStorageEntries: number
  enableNetworkReporting: boolean
  reportingEndpoint?: string
}

class ErrorReportingService {
  private config: ErrorReportingConfig
  private localStorageKey = "coinwayfinder_error_reports"
  private reportQueue: ErrorReport[] = []
  private isProcessingQueue = false

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enableConsoleLogging: process.env.NODE_ENV === "development",
      enableSentryReporting: true,
      enableLocalStorage: true,
      maxLocalStorageEntries: 50,
      enableNetworkReporting: true,
      reportingEndpoint: "/api/error-report",
      ...config,
    }

    // Process any queued reports on initialization
    this.processReportQueue()
  }

  async reportError(error: Error | ErrorReport, context?: Record<string, any>): Promise<string> {
    const errorReport: ErrorReport = this.normalizeError(error, context)

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorReport)
    }

    // Store locally if enabled
    if (this.config.enableLocalStorage) {
      this.storeLocally(errorReport)
    }

    // Report to Sentry if enabled
    if (this.config.enableSentryReporting) {
      this.reportToSentry(errorReport)
    }

    // Queue for network reporting if enabled
    if (this.config.enableNetworkReporting) {
      this.queueForNetworkReporting(errorReport)
    }

    return errorReport.errorId
  }

  private normalizeError(error: Error | ErrorReport, context?: Record<string, any>): ErrorReport {
    if (this.isErrorReport(error)) {
      return error
    }

    return {
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
      severity: "medium",
      metadata: context,
    }
  }

  private isErrorReport(obj: any): obj is ErrorReport {
    return obj && typeof obj === "object" && "errorId" in obj && "message" in obj
  }

  private logToConsole(errorReport: ErrorReport): void {
    const logLevel = this.getSeverityLogLevel(errorReport.severity)
    console[logLevel]("Error Report:", {
      id: errorReport.errorId,
      message: errorReport.message,
      severity: errorReport.severity,
      timestamp: errorReport.timestamp,
      context: errorReport.context,
      metadata: errorReport.metadata,
    })

    if (errorReport.stack) {
      console[logLevel]("Stack trace:", errorReport.stack)
    }
  }

  private getSeverityLogLevel(severity: string): "log" | "warn" | "error" {
    switch (severity) {
      case "low":
        return "log"
      case "medium":
        return "warn"
      case "high":
      case "critical":
        return "error"
      default:
        return "warn"
    }
  }

  private storeLocally(errorReport: ErrorReport): void {
    try {
      if (typeof localStorage === "undefined") return

      const existingReports = this.getLocalReports()
      const updatedReports = [errorReport, ...existingReports].slice(0, this.config.maxLocalStorageEntries)

      localStorage.setItem(this.localStorageKey, JSON.stringify(updatedReports))
    } catch (error) {
      console.warn("Failed to store error report locally:", error)
    }
  }

  private reportToSentry(errorReport: ErrorReport): string | null {
    try {
      const sentryError = new Error(errorReport.message)
      if (errorReport.stack) {
        sentryError.stack = errorReport.stack
      }

      return Sentry.captureException(sentryError, {
        tags: {
          errorId: errorReport.errorId,
          severity: errorReport.severity,
          context: errorReport.context || "unknown",
          source: "error-reporting-service",
        },
        extra: {
          ...errorReport.metadata,
          originalErrorId: errorReport.errorId,
          userAgent: errorReport.userAgent,
          url: errorReport.url,
          timestamp: errorReport.timestamp,
        },
        user: errorReport.userId ? { id: errorReport.userId } : undefined,
        level: this.getSentryLevel(errorReport.severity),
      })
    } catch (error) {
      console.warn("Failed to report error to Sentry:", error)
      return null
    }
  }

  private getSentryLevel(severity: string): "info" | "warning" | "error" | "fatal" {
    switch (severity) {
      case "low":
        return "info"
      case "medium":
        return "warning"
      case "high":
        return "error"
      case "critical":
        return "fatal"
      default:
        return "warning"
    }
  }

  private queueForNetworkReporting(errorReport: ErrorReport): void {
    this.reportQueue.push(errorReport)
    this.processReportQueue()
  }

  private async processReportQueue(): Promise<void> {
    if (this.isProcessingQueue || this.reportQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.reportQueue.length > 0) {
      const report = this.reportQueue.shift()!

      try {
        await this.sendNetworkReport(report)
      } catch (error) {
        console.warn("Failed to send error report:", error)
        // Re-queue the report for later retry
        this.reportQueue.unshift(report)
        break
      }
    }

    this.isProcessingQueue = false
  }

  private async sendNetworkReport(errorReport: ErrorReport): Promise<void> {
    if (!this.config.reportingEndpoint) {
      throw new Error("No reporting endpoint configured")
    }

    const response = await fetch(this.config.reportingEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorReport),
    })

    if (!response.ok) {
      throw new Error(`Network reporting failed: ${response.status} ${response.statusText}`)
    }
  }

  getLocalReports(): ErrorReport[] {
    try {
      if (typeof localStorage === "undefined") return []

      const stored = localStorage.getItem(this.localStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn("Failed to retrieve local error reports:", error)
      return []
    }
  }

  clearLocalReports(): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(this.localStorageKey)
      }
    } catch (error) {
      console.warn("Failed to clear local error reports:", error)
    }
  }

  getReportStats(): {
    total: number
    bySeverity: Record<string, number>
    byContext: Record<string, number>
    recent: ErrorReport[]
  } {
    const reports = this.getLocalReports()

    const bySeverity = reports.reduce(
      (acc, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byContext = reports.reduce(
      (acc, report) => {
        const context = report.context || "unknown"
        acc[context] = (acc[context] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: reports.length,
      bySeverity,
      byContext,
      recent: reports.slice(0, 10),
    }
  }
}

// Create singleton instance
export const errorReportingService = new ErrorReportingService()

// Export types and service
export type { ErrorReport, ErrorReportingConfig }
export { ErrorReportingService }
