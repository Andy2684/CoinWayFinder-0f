"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "sonner"
import { reportError, type ErrorSeverity, type ErrorContext } from "@/lib/error-reporting"

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  severity?: ErrorSeverity
  fallbackValue?: any
  onError?: (error: Error, context: ErrorContext) => void
  onRetry?: (attempt: number, error: Error) => void
  onSuccess?: (result: any, attempts: number) => void
}

export interface ErrorInfo {
  id: string
  error: Error
  context: ErrorContext
  timestamp: Date
  severity: ErrorSeverity
  resolved: boolean
  attempts: number
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

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      retryTimeouts.current.clear()
    }
  }, [])

  const addError = useCallback((error: Error, context: ErrorContext = {}, severity: ErrorSeverity = "medium") => {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      context,
      timestamp: new Date(),
      severity,
      resolved: false,
      attempts: 0,
    }

    setErrors((prev) => [errorInfo, ...prev.slice(0, 99)]) // Keep last 100 errors
    reportError(error, context, severity)

    return errorInfo.id
  }, [])

  const resolveError = useCallback((errorId: string) => {
    setErrors((prev) => prev.map((error) => (error.id === errorId ? { ...error, resolved: true } : error)))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const handleWithRetry = useCallback(async <T>(\
    operation: () => Promise<T>,\
    context: ErrorContext = {},\
    options: ErrorHandlerOptions = {}\
  ): Promise<T> => {\
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    severity = "medium",
    fallbackValue,
    onError,
    onRetry,
    onSuccess,
  } = options

  const operationId = `${context.component || "unknown"}_${Date.now()}`
  let lastError: Error
  let attempts = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1

    try {
      const result = await operation()

      if (attempt > 0 && onSuccess) {
        onSuccess(result, attempts)
      }

      if (attempt > 0 && showToast) {
        toast.success(`Operation succeeded after ${attempts} attempts`)
      }

      return result
    } catch (error) {
      lastError = error as Error

      const errorContext = {
        ...context,
        attempt: attempt + 1,
        maxRetries,
        operationId,
        isOnline,
      }

      if (onError) {
        onError(lastError, errorContext)
      }

      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break
      }

      // Don't retry certain types of errors
      if (
        lastError.name === "ValidationError" ||
        lastError.name === "AuthenticationError" ||
        lastError.message.includes("404") ||
        lastError.message.includes("401") ||
        lastError.message.includes("403")
      ) {
        break
      }

      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      if (showToast && attempt < maxRetries) {
        toast.warning(`Retrying operation (${attempt + 1}/${maxRetries})...`)
      }

      // Exponential backoff with jitter
      const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000

      await new Promise(resolve => {
          const timeout = setTimeout(resolve, delay)
          retryTimeouts.current.set(operationId, timeout)
        })

      retryTimeouts.current.delete(operationId)
    }
  }

  // All retries failed
  const errorId = addError(
    lastError,
    {
      ...context,
      totalAttempts: attempts,
      operationId,
    },
    severity,
  )

  if (showToast) {
    toast.error(`Operation failed after ${attempts} attempts: ${lastError.message}`)
  }

  if (fallbackValue !== undefined) {
    return fallbackValue
  }

  throw lastError
  \
}
, [addError, isOnline])

const handleAsync = useCallback(async <T>({
    operation,
    context = {},
    options = {}\
  }: RetryableOperation<T>): Promise<T> => {\
return handleWithRetry(operation, context, options)
\
  }, [handleWithRetry])

const wrapSync = useCallback(<T>(
    operation: () => T,
    context: ErrorContext = {},\
    options: Omit<ErrorHandlerOptions, 'maxRetries' | 'retryDelay'> = {}
  ): T | undefined => {\
    const {
      showToast = true,
      severity = 'medium',
      fallbackValue,
      onError
    } = options

    try {\
      return operation()
    } catch (error) {\
      const err = error as Error
      
      if (onError) {
        onError(err, context)
      }

      addError(err, context, severity)

      if (showToast) {
        toast.error(`Operation failed: ${err.message}`)
      }

      return fallbackValue
    }
  }, [addError])

  const getErrorStats = useCallback(() => {\
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    const recent = errors.filter(e => e.timestamp >= last24h)
    const hourly = errors.filter(e => e.timestamp >= lastHour)

    return {\
      total: errors.length,
      last24h: recent.length,
      lastHour: hourly.length,
      resolved: errors.filter(e => e.resolved).length,
      bySeverity: {\
        low: errors.filter(e => e.severity === 'low').length,
        medium: errors.filter(e => e.severity === 'medium').length,
        high: errors.filter(e => e.severity === 'high').length,
        critical: errors.filter(e => e.severity === 'critical').length
      },
      byComponent: errors.reduce((acc, error) => {\
        const component = error.context.component || 'unknown'
        acc[component] = (acc[component] || 0) + 1
        return acc\
      }, {} as Record<string, number>)
    }
  }, [errors])

  return {
    errors,
    isOnline,
    addError,
    resolveError,
    clearErrors,
    handleWithRetry,
    handleAsync,
    wrapSync,
    getErrorStats
  }\
}
