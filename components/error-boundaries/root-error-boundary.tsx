"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from "lucide-react"
import { reportError } from "@/lib/error-reporting"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string | null
  retryCount: number
  isRetrying: boolean
  reportSent: boolean
  errorCopied: boolean
}

export class RootErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private maxRetries = 3
  private retryDelay = 2000

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
      reportSent: false,
      errorCopied: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("RootErrorBoundary caught an error:", error, errorInfo)

    // Report error to service
    const errorId = reportError(error, {
      context: {
        component: "RootErrorBoundary",
        action: "componentDidCatch",
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
      },
      severity: "critical",
      extra: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      },
    })

    this.setState({
      errorInfo,
      errorId,
      reportSent: true,
    })
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return
    }

    this.setState({ isRetrying: true })

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
        reportSent: false,
        errorCopied: false,
      })
    }, this.retryDelay)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  handleCopyError = async () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      this.setState({ errorCopied: true })
      setTimeout(() => this.setState({ errorCopied: false }), 2000)
    } catch (err) {
      console.error("Failed to copy error details:", err)
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

      const isDevelopment = process.env.NODE_ENV === "development"
      const canRetry = this.state.retryCount < this.maxRetries

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Something went wrong</CardTitle>
              <CardDescription className="text-lg">
                We encountered an unexpected error. Don't worry, we're working to fix it.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={this.state.reportSent ? "default" : "secondary"}>
                    {this.state.reportSent ? "Error Reported" : "Reporting..."}
                  </Badge>
                  {this.state.errorId && (
                    <Badge variant="outline" className="font-mono text-xs">
                      ID: {this.state.errorId.slice(-8)}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Retry {this.state.retryCount}/{this.maxRetries}
                </div>
              </div>

              {/* Error Message */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message || "Unknown error occurred"}
                </AlertDescription>
              </Alert>

              {/* Development Details */}
              {isDevelopment && this.state.error && (
                <div className="space-y-3">
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Development Details</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>

                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Component Stack</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button onClick={this.handleRetry} disabled={this.state.isRetrying} className="flex-1">
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

                <Button variant="outline" onClick={this.handleReload} className="flex-1 bg-transparent">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>

                <Button variant="outline" onClick={this.handleGoHome} className="flex-1 bg-transparent">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" onClick={this.handleCopyError} className="flex-1">
                  {this.state.errorCopied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Error Details
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(
                      "mailto:support@coinwayfinder.com?subject=Error Report&body=Error ID: " + this.state.errorId,
                      "_blank",
                    )
                  }
                  className="flex-1"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500">
                If this problem persists, please contact our support team with the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
