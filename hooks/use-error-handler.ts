"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface ErrorHandlerOptions {
  showToast?: boolean
  toastMessage?: string
  logError?: boolean
  retryCount?: number
}

export interface UseErrorHandlerReturn {
  error: Error | null
  isLoading: boolean
  handleAsyncOperation: <T>(operation: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>
  clearError: () => void
  setError: (error: Error | null) => void
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAsyncOperation = useCallback(async <T>(\
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
    setError(error)

    if (options.logError !== false) {
      console.error("Error in async operation:", error)
    }

    if (options.showToast !== false) {
      toast.error(options.toastMessage || error.message)
    }

    return null
  } finally {
    setIsLoading(false)
  }
  \
}
, [])

const clearError = useCallback(() => {
  setError(null)
}, [])

return {
    error,
    isLoading,
    handleAsyncOperation,
    clearError,
    setError
  }
\
}
