"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { addBreadcrumb, Sentry } from "@/lib/sentry"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  eventId: string | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  context?: string
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: React.ErrorInfo
  resetError: () => void
  errorId: string
  eventId: string | null
  context?: string
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
      eventId: null,
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

    // Add breadcrumb for context
    addBreadcrumb(`Error boundary caught error in ${this.props.context || "unknown"}`, "error", "error")

    // Capture error with Sentry
    const eventId = Sentry.captureException(error, {
      tags: {
        component: "error-boundary",
        context: this.props.context || "unknown",
        errorId,
      },
      extra: {
        errorInfo,
        props: this.props,
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
      console.error("Error Boundary caught an error:", error, errorInfo)
    }

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
    addBreadcrumb("Error boundary reset", "navigation", "info")

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
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
          errorId={this.state.errorId}
          eventId={this.state.eventId}
          context={this.props.context}
        />
      )
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId,
  eventId,
  context,
}) => {
  const [showDetails, setShowDetails] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleReload = () => {
    addBreadcrumb("User triggered page reload", "navigation", "info")
    window.location.reload()
  }

  const handleGoHome = () => {
    addBreadcrumb("User navigated to home", "navigation", "info")
    window.location.href = "/"
  }

  const copyErrorId = async () => {
    try {
      await navigator.clipboard.writeText(eventId || errorId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Error ID copied",
        description: "The error ID has been copied to your clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy error ID:", err)
    }
  }

  const openUserFeedback = () => {
    if (eventId && process.env.NODE_ENV === "production") {
      Sentry.showReportDialog({ eventId })
    }
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
            {context
              ? `We're sorry, but something unexpected happened in the ${context} section. Our team has been notified.`
              : "We're sorry, but something unexpected happened. Our team has been notified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Error ID:</strong> {eventId || errorId}
                  <br />
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </div>
                <Button variant="ghost" size="sm" onClick={copyErrorId} className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy ID"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetError} variant="default" className="flex items-center gap-2">
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

          {eventId && process.env.NODE_ENV === "production" && (
            <div className="text-center">
              <Button onClick={openUserFeedback} variant="ghost" className="text-sm">
                Send Feedback About This Error
              </Button>
            </div>
          )}

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
                  {eventId && (
                    <div>
                      <strong>Sentry Event ID:</strong>
                      <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">{eventId}</pre>
                    </div>
                  )}
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
