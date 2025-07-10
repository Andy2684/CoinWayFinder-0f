"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  onError?: (error: Error) => void
}

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((error: Error, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, logError = true, onError } = options

    setError(error)

    if (logError) {
      console.error("Error:", error)
    }

    if (showToast) {
      toast.error(error.message || "An error occurred")
    }

    if (onError) {
      onError(error)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const executeWithErrorHandling = useCallback(
    async <T>(\
      operation: () => Promise<T>,\
      options: ErrorHandlerOptions = {}\
    ): Promise<T | null> => {\
  try {
    setIsLoading(true)
    setError(null)
    const result = await operation()
    return result
  } catch (err) {
    const error = err instanceof Error ? err : new Error("An unknown error occurred")
    handleError(error, options)
    return null
  } finally {
    setIsLoading(false)
  }
  \
}
,
    [handleError]
  )

return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  }
\
}
