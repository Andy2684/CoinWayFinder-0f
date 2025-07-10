"use client"

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

export interface ErrorHandlerOptions {
  showToast?: boolean
  toastTitle?: string
  onError?: (error: Error) => void
  retryCount?: number
}

export interface UseErrorHandlerReturn<T> {
  execute: (fn: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>
  isLoading: boolean
  error: Error | null
  clearError: () => void
  retry: () => Promise<T | null>
}

export function useErrorHandler<T = any>(): UseErrorHandlerReturn<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFunction, setLastFunction] = useState<(() => Promise<T>) | null>(null)
  const [lastOptions, setLastOptions] = useState<ErrorHandlerOptions>({})

  const execute = useCallback(async (fn: () => Promise<T>, options: ErrorHandlerOptions = {}): Promise<T | null> => {
    try {
      setIsLoading(true)
      setError(null)
      setLastFunction(() => fn)
      setLastOptions(options)

      const result = await fn()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unknown error occurred")
      setError(error)

      if (options.showToast !== false) {
        toast({
          title: options.toastTitle || "Error",
          description: error.message,
          variant: "destructive",
        })
      }

      if (options.onError) {
        options.onError(error)
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastFunction) {
      return execute(lastFunction, lastOptions)
    }
    return null
  }, [execute, lastFunction, lastOptions])

  return {
    execute,
    isLoading,
    error,
    clearError,
    retry,
  }
}

export default useErrorHandler
