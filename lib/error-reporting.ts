import { captureError as sentryCaptureError, addBreadcrumb } from "./sentry"
import {
  ErrorReportingService as ErrorReportingServiceClass,
  type ErrorReport,
  type ReportingOptions,
} from "./ErrorReportingService"

class ErrorReportingService {
  private queue: ErrorReport[] = []
  private isProcessing = false
  private maxQueueSize = 100
  private maxLocalStorageSize = 50
  private config: ReportingOptions
  private sessionId: string
  private reportQueue: ErrorReport[] = []
  private isOnline = true

  constructor(options: ReportingOptions = {}) {
    this.config = {
      console: true,
      localStorage: true,
      network: true,
      maxLocalStorage: 50,
      ...options,
    }

    this.sessionId = this.generateSessionId()
    this.setupNetworkListeners()
    this.processQueuedReports()

    // Process queue on page visibility change
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          this.processQueue()
        }
      })
    }

    // Process queue before page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.processQueue()
      })
    }
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

  async report(error: Error, context: any = {}, severity: ErrorReport["severity"] = "medium") {
    const report: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        ...context,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      },
      severity,
      environment: (process.env.NODE_ENV as any) || "development",
    }

    // Add to queue
    this.addToQueue(report)

    // Report immediately based on options
    if (this.config.console) {
      this.reportToConsole(report)
    }

    if (this.config.localStorage) {
      this.reportToLocalStorage(report)
    }

    if (this.config.network && navigator.onLine) {
      await this.reportToNetwork(report)
    }
  }

  private addToQueue(report: ErrorReport) {
    this.queue.push(report)

    // Limit queue size
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize)
    }
  }

  private reportToConsole(report: ErrorReport) {
    const logLevel =
      report.severity === "critical"
        ? "error"
        : report.severity === "high"
          ? "error"
          : report.severity === "medium"
            ? "warn"
            : "log"

    console[logLevel](`[ErrorReporting] ${report.severity.toUpperCase()}:`, {
      id: report.id,
      error: report.error,
      context: report.context,
    })
  }

  private reportToLocalStorage(report: ErrorReport) {
    try {
      const key = "error-reports"
      const existing = localStorage.getItem(key)
      const reports: ErrorReport[] = existing ? JSON.parse(existing) : []

      reports.unshift(report)

      // Limit storage size
      const limitedReports = reports.slice(0, this.config.maxLocalStorage || this.maxLocalStorageSize)

      localStorage.setItem(key, JSON.stringify(limitedReports))
    } catch (error) {
      console.warn("Failed to save error report to localStorage:", error)
    }
  }

  private async reportToNetwork(report: ErrorReport) {
    try {
      const response = await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      })

      if (!response.ok) {
        throw new Error(`Network reporting failed: ${response.status}`)
      }
    } catch (error) {
      console.warn("Failed to report error to network:", error)
      // Keep in queue for retry
      this.addToQueue(report)
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      const reports = [...this.queue]
      this.queue = []

      for (const report of reports) {
        if (this.config.network && navigator.onLine) {
          await this.reportToNetwork(report)
        } else {
          // Re-queue if offline
          this.addToQueue(report)
        }
      }
    } catch (error) {
      console.warn("Error processing report queue:", error)
    } finally {
      this.isProcessing = false
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
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        ...context,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      },
      severity,
      environment: (process.env.NODE_ENV as any) || "development",
    }
  }

  private logToConsole(report: ErrorReport): void {
    if (!this.config.console) return

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
      timestamp: report.context.timestamp,
      url: report.context.url,
      stackTrace: report.error.stack,
    })
  }

  private reportToSentry(report: ErrorReport): void {
    if (!this.config.network) return

    try {
      addBreadcrumb(
        `Error reported: ${report.error.message}`,
        "error",
        report.severity === "critical" ? "fatal" : "error",
      )

      sentryCaptureError(report.error, {
        ...report.context,
        errorId: report.id,
        sessionId: this.sessionId,
        severity: report.severity,
        timestamp: report.context.timestamp,
      })
    } catch (error) {
      console.warn("Failed to report error to Sentry:", error)
    }
  }

  private saveToLocalStorage(report: ErrorReport): void {
    if (!this.config.localStorage || typeof window === "undefined") return

    try {
      const key = "error_reports"
      const existingReports = JSON.parse(localStorage.getItem(key) || "[]")

      const updatedReports = [
        ...existingReports.slice(-(this.config.maxLocalStorage || this.maxLocalStorageSize - 1)),
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
    if (!this.config.network || !this.config.network) return

    const payload = {
      ...report,
      error: {
        name: report.error.name,
        message: report.error.message,
        stack: report.error.stack,
      },
    }

    const response = await fetch("/api/error-report", {
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
    if (this.config.network) {
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
        timestamp: new Date(report.context.timestamp),
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

  public updateConfig(newConfig: Partial<ReportingOptions>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public getQueueSize(): number {
    return this.queue.length
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingServiceClass()

// Export convenience functions
export const reportError = (
  error: unknown,
  context?: Record<string, any>,
  severity?: "low" | "medium" | "high" | "critical",
) => errorReportingService.reportError(error, context, severity)

export const getStoredErrorReports = () => errorReportingService.getStoredReports()
export const clearStoredErrorReports = () => errorReportingService.clearStoredReports()
