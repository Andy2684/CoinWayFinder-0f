import type { ErrorInfo } from "@/hooks/use-comprehensive-error-handler"

export interface ErrorReport {
  error: ErrorInfo
  context: {
    url: string
    userAgent: string
    timestamp: string
    sessionId?: string
    userId?: string
  }
  environment: {
    isDevelopment: boolean
    version: string
    buildId?: string
  }
}

export interface ErrorReportingConfig {
  endpoint: string
  apiKey?: string
  batchSize: number
  flushInterval: number
  enableConsoleLogging: boolean
  enableLocalStorage: boolean
  maxStoredErrors: number
}

class ErrorReportingService {
  private config: ErrorReportingConfig
  private errorQueue: ErrorReport[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private isOnline = true

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      endpoint: "/api/error-report",
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableConsoleLogging: process.env.NODE_ENV === "development",
      enableLocalStorage: true,
      maxStoredErrors: 100,
      ...config,
    }

    this.initializeNetworkMonitoring()
    this.loadStoredErrors()
    this.startFlushTimer()
  }

  async reportError(error: ErrorInfo): Promise<void> {
    const report: ErrorReport = {
      error,
      context: {
        url: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
      },
      environment: {
        isDevelopment: process.env.NODE_ENV === "development",
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        buildId: process.env.NEXT_PUBLIC_BUILD_ID,
      },
    }

    // Add to queue
    this.errorQueue.push(report)

    // Log to console in development
    if (this.config.enableConsoleLogging) {
      console.group(`🚨 Error Report: ${error.severity.toUpperCase()}`)
      console.error("Message:", error.message)
      console.error("Category:", error.category)
      console.error("Stack:", error.stack)
      console.error("Metadata:", error.metadata)
      console.groupEnd()
    }

    // Store locally if enabled
    if (this.config.enableLocalStorage) {
      this.storeErrorsLocally()
    }

    // Try immediate send for critical errors
    if (error.severity === "critical" && this.isOnline) {
      await this.flushErrors()
    }

    // Auto-flush if queue is full
    if (this.errorQueue.length >= this.config.batchSize) {
      await this.flushErrors()
    }
  }

  async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0 || !this.isOnline) {
      return
    }

    const errorsToSend = [...this.errorQueue]
    this.errorQueue = []

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({ errors: errorsToSend }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send errors: ${response.status}`)
      }

      // Clear stored errors on successful send
      if (this.config.enableLocalStorage) {
        localStorage.removeItem("pending-error-reports")
      }
    } catch (error) {
      // Re-queue errors if sending failed
      this.errorQueue.unshift(...errorsToSend)
      console.warn("Failed to send error reports:", error)
    }
  }

  private initializeNetworkMonitoring(): void {
    if (typeof window === "undefined") return

    this.isOnline = navigator.onLine

    window.addEventListener("online", () => {
      this.isOnline = true
      // Try to flush queued errors when back online
      this.flushErrors()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  private loadStoredErrors(): void {
    if (!this.config.enableLocalStorage || typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("pending-error-reports")
      if (stored) {
        const storedErrors: ErrorReport[] = JSON.parse(stored)
        this.errorQueue.push(...storedErrors)
      }
    } catch (error) {
      console.warn("Failed to load stored errors:", error)
    }
  }

  private storeErrorsLocally(): void {
    if (!this.config.enableLocalStorage || typeof window === "undefined") return

    try {
      const toStore = this.errorQueue.slice(-this.config.maxStoredErrors)
      localStorage.setItem("pending-error-reports", JSON.stringify(toStore))
    } catch (error) {
      console.warn("Failed to store errors locally:", error)
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushErrors()
    }, this.config.flushInterval)
  }

  private getSessionId(): string {
    if (typeof window === "undefined") return ""

    let sessionId = sessionStorage.getItem("error-session-id")
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("error-session-id", sessionId)
    }
    return sessionId
  }

  private getUserId(): string | undefined {
    // This would typically come from your auth system
    if (typeof window === "undefined") return undefined
    return localStorage.getItem("user-id") || undefined
  }

  getQueuedErrorsCount(): number {
    return this.errorQueue.length
  }

  clearQueue(): void {
    this.errorQueue = []
    if (this.config.enableLocalStorage && typeof window !== "undefined") {
      localStorage.removeItem("pending-error-reports")
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flushErrors() // Final flush
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService()

// Export for custom configurations
export { ErrorReportingService }
