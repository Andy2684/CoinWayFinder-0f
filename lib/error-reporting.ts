export interface ErrorReport {
  id: string
  message: string
  stack?: string
  context: Record<string, any>
  severity: "low" | "medium" | "high" | "critical"
  timestamp: Date
  userAgent?: string
  url?: string
  userId?: string
}

export interface ErrorReportingConfig {
  apiEndpoint?: string
  enableConsoleLogging?: boolean
  enableLocalStorage?: boolean
  maxStoredErrors?: number
  reportingThreshold?: "low" | "medium" | "high" | "critical"
}

export class ErrorReportingService {
  private config: ErrorReportingConfig
  private errorQueue: ErrorReport[] = []
  private isOnline = true

  constructor(config: ErrorReportingConfig = {}) {
    this.config = {
      apiEndpoint: "/api/error-report",
      enableConsoleLogging: true,
      enableLocalStorage: true,
      maxStoredErrors: 100,
      reportingThreshold: "medium",
      ...config,
    }

    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))
      this.loadStoredErrors()
    }
  }

  private handleOnline() {
    this.isOnline = true
    this.flushErrorQueue()
  }

  private handleOffline() {
    this.isOnline = false
  }

  private loadStoredErrors() {
    if (!this.config.enableLocalStorage) return

    try {
      const stored = localStorage.getItem("error-reports")
      if (stored) {
        this.errorQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.warn("Failed to load stored errors:", error)
    }
  }

  private saveErrorsToStorage() {
    if (!this.config.enableLocalStorage) return

    try {
      localStorage.setItem("error-reports", JSON.stringify(this.errorQueue.slice(-this.config.maxStoredErrors!)))
    } catch (error) {
      console.warn("Failed to save errors to storage:", error)
    }
  }

  private async flushErrorQueue() {
    if (!this.isOnline || this.errorQueue.length === 0) return

    const errorsToSend = [...this.errorQueue]
    this.errorQueue = []

    try {
      await fetch(this.config.apiEndpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ errors: errorsToSend }),
      })

      this.saveErrorsToStorage()
    } catch (error) {
      this.errorQueue.unshift(...errorsToSend)
      console.warn("Failed to send error reports:", error)
    }
  }

  private shouldReport(severity: string): boolean {
    const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 }
    const threshold = severityLevels[this.config.reportingThreshold as keyof typeof severityLevels] || 1
    const errorLevel = severityLevels[severity as keyof typeof severityLevels] || 1
    return errorLevel >= threshold
  }

  async reportError(error: Error, context: Partial<ErrorReport> = {}) {
    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      context: context.context || {},
      severity: context.severity || "medium",
      timestamp: new Date(),
      userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userId: context.userId,
    }

    if (!this.shouldReport(errorReport.severity)) {
      return
    }

    if (this.config.enableConsoleLogging) {
      console.error(`[${errorReport.severity.toUpperCase()}] Error Report:`, errorReport)
    }

    this.errorQueue.push(errorReport)

    if (this.isOnline) {
      await this.flushErrorQueue()
    } else {
      this.saveErrorsToStorage()
    }
  }

  getQueuedErrors(): ErrorReport[] {
    return [...this.errorQueue]
  }

  clearQueue() {
    this.errorQueue = []
    this.saveErrorsToStorage()
  }
}

export const errorReporting = new ErrorReportingService()
