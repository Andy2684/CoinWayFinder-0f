"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface ErrorHandlerOptions {
  showToast?: boolean
  toastMessage?: string
  logError?: boolean
  onError?: (error: Error) => void
}

export interface ErrorHandlerState {
  error: Error | null
  isLoading: boolean
  clearError: () => void
  handleAsyncOperation: <T>(operation: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>
}

export function useErrorHandler(): ErrorHandlerState {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

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

    if (options.onError) {
      options.onError(error)
    }

    return null
  } finally {
    setIsLoading(false)
  }
  \
}
, [])

return {
    error,
    isLoading,
    clearError,
    handleAsyncOperation
  }
\
}
