"use client"

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
  severity?: "low" | "medium" | "high" | "critical"
}

export function useErrorHandler() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((error: Error, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, logToConsole = true, reportToService = true, severity = "medium" } = options

    setError(error)

    if (logToConsole) {
      console.error("Error handled:", error)
    }

    if (reportToService) {
      // Report to error service (implement based on your service)
      console.log("Would report error to service:", { error: error.message, severity })
    }

    if (showToast) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [])

  const handleAsyncOperation = useCallback(\
    async <T>(operation: () => Promise<T>, options: ErrorHandlerOptions = {}): Promise<T | null> => {\
  try {
    setIsLoading(true)
    setError(null)
    const result = await operation()
    return result
  } catch (error) {
    handleError(error as Error, options)
    return null
  } finally {
    setIsLoading(false)
  }
  \
}
,
    [handleError],
  )

const clearError = useCallback(() => {
  setError(null)
}, [])

return {
    error,
    isLoading,
    handleError,
    handleAsyncOperation,
    clearError,
  }
\
}
