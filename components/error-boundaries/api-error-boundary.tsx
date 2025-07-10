"use client"

import React from "react"
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "../error-boundary"
import type { ErrorFallbackProps } from "../error-boundary"

const APIErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, errorId }) => {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000))
      resetError()
    } finally {
      setIsRetrying(false)
    }
  }

  const isNetworkError = error.message.includes("fetch") || error.message.includes("network")

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            {isNetworkError ? (
              <WifiOff className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <CardTitle className="text-lg font-bold">{isNetworkError ? "Connection Error" : "API Error"}</CardTitle>
          <CardDescription>
            {isNetworkError
              ? "Unable to connect to our servers. Please check your internet connection."
              : "There was an issue loading data from our servers."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground">Error ID: {errorId}</p>
            <Button onClick={handleRetry} disabled={isRetrying} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const APIErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={APIErrorFallback} resetOnPropsChange={true}>
      {children}
    </ErrorBoundary>
  )
}
