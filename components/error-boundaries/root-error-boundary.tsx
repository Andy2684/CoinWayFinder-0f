"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface RootErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: RootErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
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

    // Report error to monitoring service
    console.error("Root Error Boundary caught an error:", error, errorInfo)

    // Report to external service if available
    if (typeof window !== "undefined" && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state

    if (retryCount >= 3) {
      // Max retries reached, reload the page
      window.location.reload()
      return
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    })

    // Auto-retry after a delay if it fails again
    this.retryTimeoutId = setTimeout(() => {
      if (this.state.hasError) {
        this.handleRetry()
      }
    }, 2000 * Math.pow(2, retryCount)) // Exponential backoff
  }

  handleReportBug = () => {
    const { error, errorInfo } = this.state
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    // Create mailto link with bug report
    const subject = encodeURIComponent(`Bug Report: ${error?.message || "Application Error"}`)
    const body = encodeURIComponent(`
Bug Report Details:

Error: ${error?.message || "Unknown error"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Stack Trace:
${error?.stack || "No stack trace available"}

Component Stack:
${errorInfo?.componentStack || "No component stack available"}

Please describe what you were doing when this error occurred:
[Your description here]
    `)

    window.open(`mailto:support@coinwayfinder.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} retry={this.handleRetry} />
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">Something went wrong</CardTitle>
              <CardDescription className="text-lg">
                We apologize for the inconvenience. The application encountered an unexpected error.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error?.message || "An unknown error occurred"}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1" disabled={retryCount >= 3}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {retryCount >= 3 ? "Max Retries Reached" : `Retry ${retryCount > 0 ? `(${retryCount}/3)` : ""}`}
                </Button>

                <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button variant="outline" onClick={this.handleReportBug} className="flex-1 bg-transparent">
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {retryCount >= 3 && (
                <Alert>
                  <AlertDescription>
                    Multiple retry attempts failed. You can try refreshing the page or contact support if the problem
                    persists.
                  </AlertDescription>
                </Alert>
              )}

              {process.env.NODE_ENV === "development" && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full">
                      Show Technical Details
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <h4 className="font-semibold mb-2">Error Details:</h4>
                      <pre className="text-sm overflow-auto whitespace-pre-wrap">{error?.stack}</pre>

                      {errorInfo?.componentStack && (
                        <>
                          <h4 className="font-semibold mt-4 mb-2">Component Stack:</h4>
                          <pre className="text-sm overflow-auto whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
