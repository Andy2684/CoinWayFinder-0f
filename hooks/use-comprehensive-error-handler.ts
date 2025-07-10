"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import type { ErrorContext, ErrorHandlerConfig, UseComprehensiveErrorHandlerReturn } from "./types"

export function useComprehensiveErrorHandler(
  defaultConfig: ErrorHandlerConfig = {},
): UseComprehensiveErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastOperation, setLastOperation] = useState<{
    operation: () => Promise<any>
    context?: ErrorContext
    config?: ErrorHandlerConfig
  } | null>(null)

  const config = {
    enableLogging: true,
    enableToasts: true,
    enableRetry: false,
    maxRetries: 3,
    retryDelay: 1000,
    ...defaultConfig,
  }

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setLastOperation(null)
  }, [])

  const handleError = useCallback(
    (err: Error, context?: ErrorContext) => {
      const errorWithContext = {
        ...err,
        context: {
          ...context,
          timestamp: new Date(),
          retryCount,
        },
      }

      setError(errorWithContext)

      if (config.enableLogging) {
        console.error("Comprehensive Error Handler:", errorWithContext)
      }
      if (config.enableToasts) {
        toast.error(err.message || "An unexpected error occurred")
      }
      if (config.onError) {
        config.onError(err, context)
      }
    },
    [retryCount],
  )

  const executeWithErrorHandling = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      context?: ErrorContext,
      operationConfig?: ErrorHandlerConfig,
    ): Promise<T | null> => {
      const mergedConfig = { ...config, ...operationConfig }

      setIsLoading(true)
      setError(null)
      setLastOperation({ operation, context, config: operationConfig })

      try {
        const result = await operation()
        setRetryCount(0)
        return result
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error("An unknown error occurred")

        if (mergedConfig.enableRetry && retryCount < (mergedConfig.maxRetries || 3)) {
          setRetryCount((prev) => prev + 1)
          if (mergedConfig.retryDelay) {
            await new Promise((resolve) => setTimeout(resolve, mergedConfig.retryDelay))
          }
          return executeWithErrorHandling(operation, context, operationConfig)
        } else {
          handleError(errorObj, context)
          return null
        }
      } finally {
        setIsLoading(false)
      }
    },
    [retryCount, handleError],
  )

  const retryLastOperation = useCallback(async () => {
    if (lastOperation) {
      await executeWithErrorHandling(lastOperation.operation, lastOperation.context, lastOperation.config)
    }
  }, [lastOperation, executeWithErrorHandling])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 10000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return {
    error,
    isLoading,
    retryCount,
    clearError,
    handleError,
    executeWithErrorHandling,
    retryLastOperation,
  }
}
