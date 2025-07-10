"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, RefreshCw, Bug, Home, Mail } from "lucide-react"
import { captureError, addBreadcrumb } from "@/lib/sentry"
import { reportError } from "@/lib/error-reporting"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
  isRetrying: boolean
}

export class RootErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.setState({
      errorInfo,
      errorId,
    })

    // Add breadcrumb for context
    addBreadcrumb(`Root error boundary caught error: ${error.message}`, "error", "fatal")

    // Report to Sentry with full context
    captureError(error, {
      errorBoundary: "RootErrorBoundary",
      errorId,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    })

    // Report to our error reporting service
    reportError(
      error,
      {
        errorBoundary: "RootErrorBoundary",
        errorId,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      },
      "critical",
    )

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Root Error Boundary caught an error:", error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= 3) {
      return
    }

    this.setState({ isRetrying: true })

    // Add breadcrumb for retry attempt
    addBreadcrumb(`Retry attempt ${this.state.retryCount + 1} from root error boundary`, "retry", "info")

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      })
    }, 1000)
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  handleReportIssue = () => {
    const subject = encodeURIComponent(`Error Report: ${this.state.error?.message || "Unknown Error"}`)
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message || "Unknown"}
Stack Trace: ${this.state.error?.stack || "Not available"}
Component Stack: ${this.state.errorInfo?.componentStack || "Not available"}
URL: ${typeof window !== "undefined" ? window.location.href : "Unknown"}
User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"}
Timestamp: ${new Date().toISOString()}
    `)

    const mailtoUrl = `mailto:support@coinwayfinder.com?subject=${subject}&body=${body}`
    if (typeof window !== "undefined") {
      window.open(mailtoUrl)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const canRetry = this.state.retryCount < 3
      const errorMessage = this.state.error?.message || "An unexpected error occurred"
      const isNetworkError =
        errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>We apologize for the inconvenience. An unexpected error has occurred.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{errorMessage}</p>
                    {this.state.errorId && (
                      <p className="text-sm text-muted-foreground">
                        Error ID: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Type Badge */}
              <div className="flex justify-center">
                <Badge variant={isNetworkError ? "secondary" : "destructive"}>
                  {isNetworkError ? "Network Error" : "Application Error"}
                </Badge>
              </div>

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <Alert>
                  <AlertDescription>Retry attempts: {this.state.retryCount}/3</AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canRetry && (
                  <Button onClick={this.handleRetry} disabled={this.state.isRetrying} className="w-full">
                    {this.state.isRetrying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </>
                    )}
                  </Button>
                )}

                <Button onClick={this.handleReload} variant="outline" className="w-full bg-transparent">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>

                <Button onClick={this.handleGoHome} variant="outline" className="w-full bg-transparent">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>

                <Button onClick={this.handleReportIssue} variant="outline" className="w-full bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              </div>

              {/* Development Details */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Development Details (Click to expand)
                  </summary>
                  <div className="mt-2 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Error Stack:</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Component Stack:</h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please{" "}
                  <button onClick={this.handleReportIssue} className="underline hover:text-foreground">
                    report the issue
                  </button>{" "}
                  and we'll look into it right away.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
