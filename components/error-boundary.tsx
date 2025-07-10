"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sentryService } from "@/lib/sentry"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  component?: string
  userId?: string
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: React.ErrorInfo
  resetError: () => void
  errorId: string
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.setState({
      error,
      errorInfo,
      errorId,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo)
    }

    // Report error to Sentry
    const sentryId = sentryService.captureException(error, {
      component: this.props.component || "error-boundary",
      action: "component-error",
      userId: this.props.userId,
      additionalData: {
        errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    })

    // Add breadcrumb for context
    sentryService.addBreadcrumb(
      `Error boundary caught error in ${this.props.component || "unknown component"}`,
      "error",
      {
        errorId,
        sentryId,
        errorMessage: error.message,
      },
    )

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetError()
    }
  }

  resetError = () => {
    // Add breadcrumb for error recovery
    sentryService.addBreadcrumb(
      `Error boundary reset in ${this.props.component || "unknown component"}`,
      "navigation",
      {
        errorId: this.state.errorId,
        action: "error-recovery",
      },
    )

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
          errorId={this.state.errorId}
        />
      )
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, resetError, errorId }) => {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleReload = () => {
    sentryService.addBreadcrumb("User triggered page reload from error boundary", "user", {
      errorId,
      action: "page-reload",
    })
    window.location.reload()
  }

  const handleGoHome = () => {
    sentryService.addBreadcrumb("User navigated to home from error boundary", "navigation", {
      errorId,
      action: "navigate-home",
    })
    window.location.href = "/"
  }

  const handleRetry = () => {
    sentryService.addBreadcrumb("User triggered error retry", "user", {
      errorId,
      action: "retry-error",
    })
    resetError()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong</CardTitle>
          <CardDescription className="text-lg">
            We're sorry, but something unexpected happened. Our team has been automatically notified and is working on a
            fix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <strong>Error ID:</strong> {errorId}
              <br />
              <strong>Time:</strong> {new Date().toLocaleString()}
              <br />
              <strong>Status:</strong> Automatically reported to our monitoring system
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetry} variant="default" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button onClick={handleReload} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="space-y-3">
              <Button onClick={() => setShowDetails(!showDetails)} variant="ghost" className="w-full">
                {showDetails ? "Hide" : "Show"} Error Details
              </Button>

              {showDetails && (
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Error Message:</strong>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">{error.message}</pre>
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">{error.stack}</pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorBoundary
export { ErrorBoundary }
export type { ErrorBoundaryProps, ErrorFallbackProps }
