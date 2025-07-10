"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to our monitoring service
    fetch("/api/errors/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(console.error)
  }, [error])

  const isNetworkError = error.message.includes("fetch") || error.message.includes("network")
  const isAuthError = error.message.includes("auth") || error.message.includes("unauthorized")
  const isBotError = error.message.includes("bot") || error.message.includes("trading")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
          <CardDescription className="text-base">
            {isNetworkError && "We're having trouble connecting to our servers."}
            {isAuthError && "There was an authentication issue."}
            {isBotError && "A trading bot error occurred."}
            {!isNetworkError && !isAuthError && !isBotError && "An unexpected error occurred."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error-specific guidance */}
          <div className="text-sm text-muted-foreground space-y-2">
            {isNetworkError && (
              <div>
                <p>• Check your internet connection</p>
                <p>• Try refreshing the page</p>
                <p>• Our servers might be temporarily unavailable</p>
              </div>
            )}

            {isAuthError && (
              <div>
                <p>• You may need to sign in again</p>
                <p>• Check if your session has expired</p>
                <p>• Verify your account permissions</p>
              </div>
            )}

            {isBotError && (
              <div>
                <p>• Your trading bots are safely paused</p>
                <p>• No trades will execute until resolved</p>
                <p>• Check your API key configuration</p>
              </div>
            )}
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === "development" && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Error Details (Development)</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" onClick={() => window.open("mailto:support@coinwayfinder.com")}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Support
              </Button>
            </div>
          </div>

          {/* Error ID for support */}
          {error.digest && <div className="text-center text-xs text-muted-foreground">Error ID: {error.digest}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
