"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { addBreadcrumb, Sentry } from "@/lib/sentry"

interface BotErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  eventId: string | null
}

interface BotErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class BotErrorBoundary extends React.Component<BotErrorBoundaryProps, BotErrorBoundaryState> {
  constructor(props: BotErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      eventId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<BotErrorBoundaryState> {
    const errorId = `bot_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = `bot_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Add breadcrumb for context
    addBreadcrumb("Bot error boundary caught error", "error", "error")

    // Capture error with Sentry
    const eventId = Sentry.captureException(error, {
      tags: {
        component: "bot-error-boundary",
        section: "bots",
        errorId,
      },
      extra: {
        errorInfo,
        componentStack: errorInfo.componentStack,
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    this.setState({
      error,
      errorInfo,
      errorId,
      eventId,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Bot Error Boundary caught an error:", error, errorInfo)
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    addBreadcrumb("Bot error boundary reset", "navigation", "info")
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      eventId: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Bot Management Error</CardTitle>
              <CardDescription className="text-lg">
                There was an error with your trading bots. Our team has been notified and is working on a fix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error ID:</strong> {this.state.eventId || this.state.errorId}
                  <br />
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.resetError} variant="default" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </div>

              {this.state.eventId && process.env.NODE_ENV === "production" && (
                <div className="text-center">
                  <Button
                    onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId! })}
                    variant="ghost"
                    className="text-sm"
                  >
                    Send Feedback About This Error
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export { BotErrorBoundary }
