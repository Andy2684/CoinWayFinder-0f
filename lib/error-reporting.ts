"use client"

import * as Sentry from "@sentry/nextjs"

export interface ErrorReportOptions {
  context?: Record<string, any>
  severity?: "low" | "medium" | "high" | "critical"
  tags?: Record<string, string>
  user?: {
    id?: string
    email?: string
    username?: string
  }
  extra?: Record<string, any>
  stack?: string
}

export interface ErrorReport {
  id: string
  timestamp: Date
  message: string
  stack?: string
  context: Record<string, any>
  severity: string
  reported: boolean
  reportChannels: string[]
}

export class ErrorReportingService {
  private errorQueue: ErrorReport[] = []
  private isReporting = false
  private maxQueueSize = 100
  private reportingChannels: Set<string> = new Set(["console", "sentry"])

  constructor() {
    this.loadQueueFromStorage()
    this.setupPeriodicReporting()
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem("error_queue")
      if (stored) {
        const parsed = JSON.parse(stored)
        this.errorQueue = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      }
    } catch (error) {
      console.warn("Failed to load error queue from storage:", error)
    }
  }

  private saveQueueToStorage(): void {
    try {
      // Keep only recent errors to prevent storage bloat
      const recentErrors = this.errorQueue.slice(0, this.maxQueueSize)
      localStorage.setItem("error_queue", JSON.stringify(recentErrors))
    } catch (error) {
      console.warn("Failed to save error queue to storage:", error)
    }
  }

  private setupPeriodicReporting(): void {
    // Report queued errors every 30 seconds
    setInterval(() => {
      this.processErrorQueue()
    }, 30000)

    // Report immediately when online
    window.addEventListener("online", () => {
      this.processErrorQueue()
    })
  }

  public reportError(error: Error, options: ErrorReportOptions = {}): string {
    const report: ErrorReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      message: error.message,
      stack: error.stack || options.stack,
      context: options.context || {},
      severity: options.severity || "medium",
      reported: false,
      reportChannels: [],
    }

    // Add to queue
    this.errorQueue.unshift(report)

    // Trim queue if too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize)
    }

    this.saveQueueToStorage()

    // Try to report immediately
    this.reportSingle(report, options)

    return report.id
  }

  private async reportSingle(report: ErrorReport, options: ErrorReportOptions): Promise<void> {
    const reportChannels: string[] = []

    // Console reporting (always available)
    if (this.reportingChannels.has("console")) {
      this.reportToConsole(report, options)
      reportChannels.push("console")
    }

    // Sentry reporting
    if (this.reportingChannels.has("sentry")) {
      try {
        await this.reportToSentry(report, options)
        reportChannels.push("sentry")
      } catch (error) {
        console.warn("Failed to report to Sentry:", error)
      }
    }

    // Local storage reporting
    if (this.reportingChannels.has("localStorage")) {
      try {
        this.reportToLocalStorage(report)
        reportChannels.push("localStorage")
      } catch (error) {
        console.warn("Failed to report to localStorage:", error)
      }
    }

    // Network reporting
    if (this.reportingChannels.has("network") && navigator.onLine) {
      try {
        await this.reportToNetwork(report, options)
        reportChannels.push("network")
      } catch (error) {
        console.warn("Failed to report to network:", error)
      }
    }

    // Update report status
    report.reported = reportChannels.length > 0
    report.reportChannels = reportChannels
  }

  private reportToConsole(report: ErrorReport, options: ErrorReportOptions): void {
    const style = this.getConsoleStyle(report.severity)

    console.group(`%c🚨 Error Report [${report.severity.toUpperCase()}]`, style)
    console.error("Message:", report.message)
    console.error("Timestamp:", report.timestamp.toISOString())
    console.error("Context:", report.context)

    if (report.stack) {
      console.error("Stack:", report.stack)
    }

    if (options.extra) {
      console.error("Extra:", options.extra)
    }

    console.groupEnd()
  }

  private getConsoleStyle(severity: string): string {
    const styles = {
      low: "color: #3b82f6; font-weight: bold;",
      medium: "color: #f59e0b; font-weight: bold;",
      high: "color: #ef4444; font-weight: bold;",
      critical: "color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 4px;",
    }
    return styles[severity as keyof typeof styles] || styles.medium
  }

  private async reportToSentry(report: ErrorReport, options: ErrorReportOptions): Promise<void> {
    Sentry.withScope((scope) => {
      // Set severity
      const sentryLevel = this.mapSeverityToSentryLevel(report.severity)
      scope.setLevel(sentryLevel)

      // Set context
      scope.setContext("error_report", {
        id: report.id,
        timestamp: report.timestamp.toISOString(),
        ...report.context,
      })

      // Set tags
      if (options.tags) {
        Object.entries(options.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }

      // Set user
      if (options.user) {
        scope.setUser(options.user)
      }

      // Set extra data
      if (options.extra) {
        scope.setExtra("additional_data", options.extra)
      }

      // Capture the error
      Sentry.captureException(new Error(report.message))
    })
  }

  private mapSeverityToSentryLevel(severity: string): Sentry.SeverityLevel {
    const mapping = {
      low: "info" as Sentry.SeverityLevel,
      medium: "warning" as Sentry.SeverityLevel,
      high: "error" as Sentry.SeverityLevel,
      critical: "fatal" as Sentry.SeverityLevel,
    }
    return mapping[severity as keyof typeof mapping] || "error"
  }

  private reportToLocalStorage(report: ErrorReport): void {
    try {
      const key = `error_report_${report.id}`
      const data = {
        ...report,
        timestamp: report.timestamp.toISOString(),
      }
      localStorage.setItem(key, JSON.stringify(data))

      // Clean up old reports (keep last 50)
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("error_report_"))
      if (keys.length > 50) {
        keys
          .sort()
          .slice(0, keys.length - 50)
          .forEach((key) => {
            localStorage.removeItem(key)
          })
      }
    } catch (error) {
      console.warn("Failed to save error report to localStorage:", error)
    }
  }

  private async reportToNetwork(report: ErrorReport, options: ErrorReportOptions): Promise<void> {
    const payload = {
      id: report.id,
      timestamp: report.timestamp.toISOString(),
      message: report.message,
      stack: report.stack,
      context: report.context,
      severity: report.severity,
      options,
    }

    const response = await fetch("/api/error-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Network reporting failed: ${response.status}`)
    }
  }

  private async processErrorQueue(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return
    }

    this.isReporting = true

    try {
      const unreportedErrors = this.errorQueue.filter((report) => !report.reported)

      for (const report of unreportedErrors) {
        try {
          await this.reportSingle(report, {})
        } catch (error) {
          console.warn(`Failed to process error report ${report.id}:`, error)
        }
      }

      this.saveQueueToStorage()
    } finally {
      this.isReporting = false
    }
  }

  public getQueueStats(): {
    total: number
    reported: number
    unreported: number
    oldestUnreported?: Date
  } {
    const reported = this.errorQueue.filter((r) => r.reported).length
    const unreported = this.errorQueue.filter((r) => !r.reported)

    return {
      total: this.errorQueue.length,
      reported,
      unreported: unreported.length,
      oldestUnreported: unreported.length > 0 ? unreported[unreported.length - 1].timestamp : undefined,
    }
  }

  public clearQueue(): void {
    this.errorQueue = []
    this.saveQueueToStorage()
  }

  public configureChannels(channels: string[]): void {
    this.reportingChannels = new Set(channels)
  }
}

// Export singleton instance
export const reportError = (error: Error, options?: ErrorReportOptions): string => {
  const service = new ErrorReportingService()
  return service.reportError(error, options)
}
