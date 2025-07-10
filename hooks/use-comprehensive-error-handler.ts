"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "sonner"

export interface ErrorInfo {
  id: string
  message: string
  stack?: string
  timestamp: Date
  url?: string
  userAgent?: string
  userId?: string
  severity: "low" | "medium" | "high" | "critical"
  category: "network" | "validation" | "auth" | "api" | "ui" | "unknown"
  metadata?: Record<string, any>
  retryCount?: number
}

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  reportError?: boolean
  fallbackValue?: any
  onError?: (error: ErrorInfo) => void
  onRetry?: (attempt: number) => void
  onSuccess?: () => void
}

export interface ErrorStats {
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsBySeverity: Record<string, number>
  recentErrors: ErrorInfo[]
  networkStatus: "online" | "offline"
  lastErrorTime?: Date
}

class ErrorReportingService {
  private errors: ErrorInfo[] = []
  private maxStoredErrors = 100
  private reportingEndpoint = "/api/error-report"

  async reportError(error: ErrorInfo): Promise<void> {
    try {
      // Store locally first
      this.storeError(error)

      // Try to send to server
      if (navigator.onLine) {
        await fetch(this.reportingEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(error),
        })
      }
    } catch (reportingError) {
      console.warn("Failed to report error:", reportingError)
    }
  }

  private storeError(error: ErrorInfo): void {
    this.errors.unshift(error)
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors)
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem("error-logs", JSON.stringify(this.errors.slice(0, 20)))
    } catch (e) {
      console.warn("Failed to store errors in localStorage:", e)
    }
  }

  getErrors(): ErrorInfo[] {
    return this.errors
  }

  getErrorStats(): ErrorStats {
    const errorsByCategory = this.errors.reduce(
      (acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const errorsBySeverity = this.errors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errors.slice(0, 10),
      networkStatus: navigator.onLine ? "online" : "offline",
      lastErrorTime: this.errors[0]?.timestamp,
    }
  }

  clearErrors(): void {
    this.errors = []
    localStorage.removeItem("error-logs")
  }
}

const errorReportingService = new ErrorReportingService()

export function useComprehensiveErrorHandler() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorStats, setErrorStats] = useState<ErrorStats>(() => errorReportingService.getErrorStats())
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const categorizeError = (error: Error): ErrorInfo["category"] => {
    const message = error.message.toLowerCase()
    if (message.includes("network") || message.includes("fetch")) return "network"
    if (message.includes("validation") || message.includes("invalid")) return "validation"
    if (message.includes("auth") || message.includes("unauthorized")) return "auth"
    if (message.includes("api") || message.includes("server")) return "api"
    if (message.includes("render") || message.includes("component")) return "ui"
    return "unknown"
  }

  const determineSeverity = (error: Error, category: ErrorInfo["category"]): ErrorInfo["severity"] => {
    if (category === "auth") return "high"
    if (category === "network" && error.message.includes("timeout")) return "medium"
    if (category === "validation") return "low"
    if (error.message.includes("critical") || error.message.includes("fatal")) return "critical"
    return "medium"
  }

  const createErrorInfo = (error: Error, metadata?: Record<string, any>): ErrorInfo => {
    const category = categorizeError(error)
    const severity = determineSeverity(error, category)

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity,
      category,
      metadata,
    }
  }

  const handleError = useCallback(
    async (operation: () => Promise<any>, options: ErrorHandlerOptions = {}): Promise<any> => {
      const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        reportError = true,
        fallbackValue,
        onError,
        onRetry,
        onSuccess,
      } = options

      let lastError: Error
      let attempt = 0

      while (attempt <= maxRetries) {
        try {
          setIsLoading(true)
          const result = await operation()
          setIsLoading(false)

          if (attempt > 0 && onSuccess) {
            onSuccess()
          }

          return result
        } catch (error) {
          lastError = error as Error
          attempt++

          const errorInfo = createErrorInfo(lastError, {
            attempt,
            maxRetries,
            operation: operation.name || "anonymous",
          })

          if (attempt <= maxRetries) {
            if (onRetry) {
              onRetry(attempt)
            }

            if (showToast) {
              toast.error(`Attempt ${attempt} failed. Retrying...`, {
                duration: 2000,
              })
            }

            // Exponential backoff
            const delay = retryDelay * Math.pow(2, attempt - 1)
            await new Promise((resolve) => setTimeout(resolve, delay))
          } else {
            // Final failure
            if (reportError) {
              await errorReportingService.reportError(errorInfo)
            }

            if (onError) {
              onError(errorInfo)
            }

            if (showToast) {
              toast.error(`Operation failed: ${lastError.message}`, {
                duration: 5000,
                action: {
                  label: "Retry",
                  onClick: () => handleError(operation, options),
                },
              })
            }

            setErrorStats(errorReportingService.getErrorStats())
            setIsLoading(false)

            if (fallbackValue !== undefined) {
              return fallbackValue
            }

            throw lastError
          }
        }
      }

      setIsLoading(false)
      throw lastError!
    },
    [],
  )

  const handleErrorSync = useCallback(
    (error: Error, options: Omit<ErrorHandlerOptions, "maxRetries" | "retryDelay"> = {}): void => {
      const { showToast = true, reportError = true, onError } = options

      const errorInfo = createErrorInfo(error)

      if (reportError) {
        errorReportingService.reportError(errorInfo)
      }

      if (onError) {
        onError(errorInfo)
      }

      if (showToast) {
        toast.error(error.message, {
          duration: 5000,
        })
      }

      setErrorStats(errorReportingService.getErrorStats())
    },
    [],
  )

  const clearErrors = useCallback(() => {
    errorReportingService.clearErrors()
    setErrorStats(errorReportingService.getErrorStats())
  }, [])

  const retryOperation = useCallback((operation: () => Promise<any>, delay = 1000): Promise<any> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await operation()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)

      retryTimeouts.current.set(operation.name || "anonymous", timeoutId)
    })
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      retryTimeouts.current.clear()
    }
  }, [])

  // Network status monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      setErrorStats((prev) => ({
        ...prev,
        networkStatus: navigator.onLine ? "online" : "offline",
      }))
    }

    window.addEventListener("online", updateNetworkStatus)
    window.addEventListener("offline", updateNetworkStatus)

    return () => {
      window.removeEventListener("online", updateNetworkStatus)
      window.removeEventListener("offline", updateNetworkStatus)
    }
  }, [])

  return {
    handleError,
    handleErrorSync,
    clearErrors,
    retryOperation,
    isLoading,
    errorStats,
    reportingService: errorReportingService,
  }
}

export default useComprehensiveErrorHandler
