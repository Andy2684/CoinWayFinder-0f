import { captureError as sentryCaptureError, addBreadcrumb } from "./sentry"

export interface ErrorReport {
  id: string
  error: Error
  context: Record<string, any>
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  userId?: string
  sessionId: string
  userAgent: string
  url: string
  stackTrace?: string
}

export interface ErrorReportingConfig {
  enableConsoleLogging: boolean
  enableSentryReporting: boolean
  enableLocalStorage: boolean
  enableNetworkReporting: boolean
  maxLocalStorageEntries: number
  reportingEndpoint?: string
}

class ErrorReportingService {
  private config: ErrorReportingConfig
  private sessionId: string
  private reportQueue: ErrorReport[] = []
  private isOnline = true

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableSentryReporting: true,
      enableLocalStorage: true,
      enableNetworkReporting: false,
      maxLocalStorageEntries: 100,
      ...config,
    }

    this.sessionId = this.generateSessionId()
    this.setupNetworkListeners()
    this.processQueuedReports()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupNetworkListeners(): void {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      window.addEventListener("online", () => {
        this.isOnline = true
        this.processQueuedReports()
      })
      window.addEventListener("offline", () => {
        this.isOnline = false
      })
    }
  }

  private async processQueuedReports(): Promise<void> {
    if (!this.isOnline || this.reportQueue.length === 0) return

    const reportsToProcess = [...this.reportQueue]
    this.reportQueue = []

    for (const report of reportsToProcess) {
      try {
        await this.sendNetworkReport(report)
      } catch (error) {
        // Re-queue failed reports
        this.reportQueue.push(report)
        console.warn("Failed to send queued error report:", error)
      }
    }
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }

    if (typeof error === "string") {
      return new Error(error)
    }

    if (typeof error === "object" && error !== null) {
      return new Error(JSON.stringify(error))
    }

    return new Error("Unknown error occurred")
  }

  private createErrorReport(
    error: Error,
    context: Record<string, any> = {},
    severity: "low" | "medium" | "high" | "critical" = "medium",
  ): ErrorReport {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      context,
      timestamp: new Date(),
      severity,
      userId: context.userId,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      stackTrace: error.stack,
    }
  }

  private logToConsole(report: ErrorReport): void {
    if (!this.config.enableConsoleLogging) return

    const logMethod = {
      low: console.info,
      medium: console.warn,
      high: console.error,
      critical: console.error,
    }[report.severity]

    logMethod(`[${report.severity.toUpperCase()}] Error Report:`, {
      id: report.id,
      message: report.error.message,
      context: report.context,
      timestamp: report.timestamp.toISOString(),
      url: report.url,
      stackTrace: report.stackTrace,
    })
  }

  private reportToSentry(report: ErrorReport): void {
    if (!this.config.enableSentryReporting) return

    try {
      addBreadcrumb(
        `Error reported: ${report.error.message}`,
        "error",
        report.severity === "critical" ? "fatal" : "error",
      )

      sentryCaptureError(report.error, {
        ...report.context,
        errorId: report.id,
        sessionId: report.sessionId,
        severity: report.severity,
        timestamp: report.timestamp.toISOString(),
      })
    } catch (error) {
      console.warn("Failed to report error to Sentry:", error)
    }
  }

  private saveToLocalStorage(report: ErrorReport): void {
    if (!this.config.enableLocalStorage || typeof window === "undefined") return

    try {
      const key = "error_reports"
      const existingReports = JSON.parse(localStorage.getItem(key) || "[]")

      const updatedReports = [
        ...existingReports.slice(-(this.config.maxLocalStorageEntries - 1)),
        {
          ...report,
          error: {
            name: report.error.name,
            message: report.error.message,
            stack: report.error.stack,
          },
        },
      ]

      localStorage.setItem(key, JSON.stringify(updatedReports))
    } catch (error) {
      console.warn("Failed to save error report to localStorage:", error)
    }
  }

  private async sendNetworkReport(report: ErrorReport): Promise<void> {
    if (!this.config.enableNetworkReporting || !this.config.reportingEndpoint) return

    const payload = {
      ...report,
      error: {
        name: report.error.name,
        message: report.error.message,
        stack: report.error.stack,
      },
    }

    const response = await fetch(this.config.reportingEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Network reporting failed: ${response.status} ${response.statusText}`)
    }
  }

  public async reportError(
    error: unknown,
    context: Record<string, any> = {},
    severity: "low" | "medium" | "high" | "critical" = "medium",
  ): Promise<string> {
    const normalizedError = this.normalizeError(error)
    const report = this.createErrorReport(normalizedError, context, severity)

    // Log to console
    this.logToConsole(report)

    // Report to Sentry
    this.reportToSentry(report)

    // Save to localStorage
    this.saveToLocalStorage(report)

    // Send network report or queue it
    if (this.config.enableNetworkReporting) {
      if (this.isOnline) {
        try {
          await this.sendNetworkReport(report)
        } catch (error) {
          this.reportQueue.push(report)
          console.warn("Queued error report for later transmission:", error)
        }
      } else {
        this.reportQueue.push(report)
      }
    }

    return report.id
  }

  public getStoredReports(): ErrorReport[] {
    if (typeof window === "undefined") return []

    try {
      const reports = JSON.parse(localStorage.getItem("error_reports") || "[]")
      return reports.map((report: any) => ({
        ...report,
        timestamp: new Date(report.timestamp),
        error: new Error(report.error.message),
      }))
    } catch (error) {
      console.warn("Failed to retrieve stored error reports:", error)
      return []
    }
  }

  public clearStoredReports(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem("error_reports")
    } catch (error) {
      console.warn("Failed to clear stored error reports:", error)
    }
  }

  public getQueuedReportsCount(): number {
    return this.reportQueue.length
  }

  public updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService()

// Export convenience functions
export const reportError = (
  error: unknown,
  context?: Record<string, any>,
  severity?: "low" | "medium" | "high" | "critical",
) => errorReportingService.reportError(error, context, severity)

export const getStoredErrorReports = () => errorReportingService.getStoredReports()
export const clearStoredErrorReports = () => errorReportingService.clearStoredReports()
