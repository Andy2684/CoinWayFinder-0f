"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { reportError } from "@/lib/error-reporting"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

export class RootErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Report error
    reportError(
      error,
      {
        component: "RootErrorBoundary",
        action: "componentDidCatch",
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      },
      "critical",
    )

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Auto-retry after 5 seconds for the first 2 attempts
    if (this.state.retryCount < 2) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry()
      }, 5000)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  handleReportBug = () => {
    const { error, errorInfo } = this.state
    const bugReport = {
      error: error?.message || "Unknown error",
      stack: error?.stack || "No stack trace",
      componentStack: errorInfo?.componentStack || "No component stack",
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }

    // In a real app, you might open a bug report form or send to an endpoint
    console.log("Bug report:", bugReport)

    // For now, copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(bugReport, null, 2))
      .then(() => {
        alert("Bug report copied to clipboard!")
      })
      .catch(() => {
        alert("Failed to copy bug report. Please check the console for details.")
      })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, retryCount } = this.state
      const isDevelopment = process.env.NODE_ENV === "development"

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Something went wrong</CardTitle>
              <CardDescription className="text-gray-600">
                We apologize for the inconvenience. The application encountered an unexpected error.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Message */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error?.message || "An unexpected error occurred"}
                </AlertDescription>
              </Alert>

              {/* Retry Information */}
              {retryCount > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Retry attempts:</strong> {retryCount}/2
                    {retryCount < 2 && " (Auto-retry in 5 seconds)"}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1" variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button onClick={this.handleReload} className="flex-1 bg-transparent" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button onClick={this.handleGoHome} className="flex-1 bg-transparent" variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Bug Report Button */}
              <div className="text-center">
                <Button onClick={this.handleReportBug} variant="ghost" size="sm">
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {/* Development Details */}
              {isDevelopment && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Development Details (Click to expand)
                  </summary>
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Error Stack:</h4>
                        <pre className="mt-2 text-xs text-gray-700 overflow-auto whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>

                      {errorInfo && (
                        <div>
                          <h4 className="font-medium text-gray-900">Component Stack:</h4>
                          <pre className="mt-2 text-xs text-gray-700 overflow-auto whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500">
                If this problem persists, please contact support with the error details above.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
