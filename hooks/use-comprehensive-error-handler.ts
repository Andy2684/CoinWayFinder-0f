"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "sonner"

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  enableRetry?: boolean
  severity?: "low" | "medium" | "high" | "critical"
  reportToService?: boolean
  showUserNotification?: boolean
}

export interface ErrorInfo {
  id: string
  message: string
  stack?: string
  context: ErrorContext
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  resolved: boolean
  retryCount: number
}

export interface ErrorStats {
  total: number
  byComponent: Record<string, number>
  bySeverity: Record<string, number>
  resolved: number
  unresolved: number
  recentErrors: ErrorInfo[]
}

export interface RetryableOperation<T> {
  operation: () => Promise<T>
  context?: ErrorContext
  options?: ErrorHandlerOptions
}

export function useComprehensiveErrorHandler() {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
      retryTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      retryTimeouts.current.clear()
    }
  }, [])

  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const addError = useCallback(
    (error: Omit<ErrorInfo, "id" | "timestamp" | "resolved" | "retryCount">) => {
      const errorInfo: ErrorInfo = {
        ...error,
        id: generateErrorId(),
        timestamp: new Date(),
        resolved: false,
        retryCount: 0,
      }

      setErrors((prev) => [errorInfo, ...prev.slice(0, 99)]) // Keep last 100 errors

      // Report error to console
      console.error(`[${error.severity.toUpperCase()}] Error in ${error.context.component || "unknown"}:`, {
        message: error.message,
        context: error.context,
        stack: error.stack,
      })

      return errorInfo.id
    },
    [generateErrorId],
  )

  const resolveError = useCallback((errorId: string) => {
    setErrors((prev) => prev.map((error) => (error.id === errorId ? { ...error, resolved: true } : error)))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const handleError = useCallback(
    async <T>(\
      operation: () => Promise<T>,\
      context: ErrorContext = {},\
      options: ErrorHandlerOptions = {}\
    ): Promise<T> => {\
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableRetry = true,
    severity = "medium",
    reportToService = true,
    showUserNotification = true,
  } = options

  const operationId = `${context.component || "unknown"}_${context.action || "operation"}_${Date.now()}`
  let lastError: Error
  let retryCount = 0

  const executeWithRetry = async (): Promise<T> => {
    try {
      const result = await operation()

      // If we had previous errors for this operation, mark them as resolved
      const operationErrors = errors.filter(
        (e) => e.context.component === context.component && e.context.action === context.action && !e.resolved,
      )

      operationErrors.forEach((error) => resolveError(error.id))

      if (retryCount > 0 && showUserNotification) {
        toast.success(`Operation succeeded after ${retryCount} retries`)
      }

      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      retryCount++

      const errorId = addError({
        message: lastError.message,
        stack: lastError.stack,
        context: { ...context, operationId, retryCount },
        severity,
      })

      if (enableRetry && retryCount < maxRetries) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, retryCount - 1) + Math.random() * 1000

        if (showUserNotification) {
          toast.warning(`Retrying operation (${retryCount}/${maxRetries})...`)
        }

        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, delay)
          retryTimeouts.current.set(operationId, timeout)
        })

        retryTimeouts.current.delete(operationId)
        return executeWithRetry()
      }

      // Update final error with retry count
      setErrors((prev) => prev.map((e) => (e.id === errorId ? { ...e, retryCount } : e)))

      if (showUserNotification) {
        toast.error(`Operation failed after ${retryCount} attempts: ${lastError.message}`)
      }

      throw lastError
    }
  }

  return executeWithRetry()
  \
}
,
    [errors, addError, resolveError],
  )

const handleErrorWithRetry = useCallback(\
    async <T>({ operation, context = {}, options = {} }: RetryableOperation<T>): Promise<T> => {\
return handleError(operation, context, options)
\
    },
    [handleError],
  )

const getErrorStats = useCallback((): ErrorStats => {
  const byComponent: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  let resolved = 0
  let unresolved = 0

  errors.forEach((error) => {
    const component = error.context.component || "unknown"
    byComponent[component] = (byComponent[component] || 0) + 1
    bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1

    if (error.resolved) {
      resolved++
    } else {
      unresolved++
    }
  })

  return {
    total: errors.length,
    byComponent,
    bySeverity,
    resolved,
    unresolved,
    recentErrors: errors.slice(0, 10),
  }
}, [errors])

const exportErrors = useCallback(() => {
  const errorData = {
    timestamp: new Date().toISOString(),
    stats: getErrorStats(),
    errors: errors,
  }

  const blob = new Blob([JSON.stringify(errorData, null, 2)], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `error-report-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}, [errors, getErrorStats])

return {
    errors,
    isOnline,
    handleError,
    handleErrorWithRetry,
    addError,
    resolveError,
    clearErrors,
    getErrorStats,
    exportErrors,
  }
\
}
