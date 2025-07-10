"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { errorReporting } from "@/lib/error-reporting"

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Report error
    errorReporting.report(
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

    console.error("Root Error Boundary caught an error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ isRetrying: true })

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      })
    }, 1000)
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

    // Create mailto link with bug report
    const subject = encodeURIComponent("Bug Report: Application Error")
    const body = encodeURIComponent(
      `
Bug Report Details:

Error: ${bugReport.error}
URL: ${bugReport.url}
Timestamp: ${bugReport.timestamp}

Stack Trace:
${bugReport.stack}

Component Stack:
${bugReport.componentStack}

User Agent:
${bugReport.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim(),
    )

    window.open(`mailto:support@coinwayfinder.com?subject=${subject}&body=${body}`)
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, retryCount, isRetrying } = this.state
      const isDevelopment = process.env.NODE_ENV === "development"

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Oops! Something went wrong</CardTitle>
              <CardDescription className="text-lg">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Summary */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error?.message || "Unknown error occurred"}
                </AlertDescription>
              </Alert>

              {/* Retry Information */}
              {retryCount > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Retry attempts:</strong> {retryCount}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} disabled={isRetrying} className="flex-1">
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={this.handleGoHome} className="flex-1 bg-transparent">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button variant="outline" onClick={this.handleReportBug} className="flex-1 bg-transparent">
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
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Error Message:</h4>
                        <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded border">{error.message}</p>
                      </div>

                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-gray-900">Stack Trace:</h4>
                          <pre className="text-xs text-gray-700 font-mono bg-white p-2 rounded border overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-gray-900">Component Stack:</h4>
                          <pre className="text-xs text-gray-700 font-mono bg-white p-2 rounded border overflow-auto max-h-40">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  If this problem persists, please contact our support team at{" "}
                  <a href="mailto:support@coinwayfinder.com" className="text-blue-600 hover:text-blue-800 underline">
                    support@coinwayfinder.com
                  </a>
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

export default RootErrorBoundary
