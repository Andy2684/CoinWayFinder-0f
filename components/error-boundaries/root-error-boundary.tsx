"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { addBreadcrumb, Sentry } from "@/lib/sentry"

interface RootErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  eventId: string | null
  retryCount: number
}

interface RootErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: RootErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      eventId: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<RootErrorBoundaryState> {
    const errorId = `root_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = `root_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Add breadcrumb for context
    addBreadcrumb("Root error boundary caught critical error", "error", "fatal")

    // Capture error with Sentry
    const eventId = Sentry.captureException(error, {
      tags: {
        component: "root-error-boundary",
        section: "root",
        errorId,
        severity: "critical",
      },
      extra: {
        errorInfo,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      level: "fatal",
    })

    this.setState({
      error,
      errorInfo,
      errorId,
      eventId,
    })

    // Log error to console
    console.error("Root Error Boundary caught a critical error:", error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry()
    }
  }

  shouldAutoRetry = (error: Error): boolean => {
    const retryableErrors = ["ChunkLoadError", "Loading chunk", "NetworkError", "Failed to fetch"]
    return retryableErrors.some((errorType) => error.message.includes(errorType) || error.name.includes(errorType))
  }

  scheduleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000) // Exponential backoff

    this.retryTimeout = setTimeout(() => {
      addBreadcrumb(`Auto-retry attempt ${this.state.retryCount + 1}`, "navigation", "info")
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: "",
        eventId: null,
        retryCount: prevState.retryCount + 1,
      }))
    }, delay)
  }

  resetError = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }

    addBreadcrumb("Root error boundary reset by user", "navigation", "info")
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      eventId: null,
      retryCount: 0,
    })
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    if (this.state.hasError) {
      return <CriticalErrorFallback {...this.state} resetError={this.resetError} />
    }

    return this.props.children
  }
}

const CriticalErrorFallback: React.FC<{
  error: Error
  errorInfo: React.ErrorInfo
  errorId: string
  eventId: string | null
  retryCount: number
  resetError: () => void
}> = ({ error, errorInfo, errorId, eventId, retryCount, resetError }) => {
  const [showDetails, setShowDetails] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [feedbackSent, setFeedbackSent] = React.useState(false)

  const copyErrorDetails = async () => {
    const errorDetails = `
Error ID: ${eventId || errorId}
Time: ${new Date().toISOString()}
Message: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Retry Count: ${retryCount}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorDetails)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Error details copied",
        description: "Full error details have been copied to your clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy error details:", err)
    }
  }

  const sendFeedback = () => {
    if (eventId && process.env.NODE_ENV === "production") {
      Sentry.showReportDialog({ eventId })
      setFeedbackSent(true)
    }
  }

  const reloadApplication = () => {
    addBreadcrumb("User triggered application reload", "navigation", "info")
    window.location.reload()
  }

  const goToHome = () => {
    addBreadcrumb("User navigated to home from error", "navigation", "info")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl border-red-200 dark:border-red-800">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            Critical Application Error
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            We're sorry, but a critical error has occurred that prevents the application from running properly. Our
            development team has been automatically notified.
          </CardDescription>
          {retryCount > 0 && (
            <Badge variant="outline" className="mt-2 mx-auto w-fit">
              Auto-retry attempts: {retryCount}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-red-200 dark:border-red-800">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div>
                    <strong>Error ID:</strong> {eventId || errorId}
                  </div>
                  <div>
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </div>
                  <div>
                    <strong>Type:</strong> {error.name}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyErrorDetails}
                  className="flex items-center gap-2 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Details"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={resetError} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button onClick={reloadApplication} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Reload App
            </Button>
            <Button onClick={goToHome} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
            {eventId && process.env.NODE_ENV === "production" && (
              <Button
                onClick={sendFeedback}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                disabled={feedbackSent}
              >
                <Mail className="w-4 h-4" />
                {feedbackSent ? "Feedback Sent" : "Send Feedback"}
              </Button>
            )}
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="space-y-4 border-t pt-4">
              <Button onClick={() => setShowDetails(!showDetails)} variant="ghost" className="w-full">
                {showDetails ? "Hide" : "Show"} Technical Details
              </Button>

              {showDetails && (
                <div className="space-y-4 text-sm">
                  <div>
                    <strong className="block mb-2">Error Message:</strong>
                    <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto border">
                      {error.message}
                    </pre>
                  </div>
                  <div>
                    <strong className="block mb-2">Stack Trace:</strong>
                    <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40 border">
                      {error.stack}
                    </pre>
                  </div>
                  <div>
                    <strong className="block mb-2">Component Stack:</strong>
                    <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40 border">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                  {eventId && (
                    <div>
                      <strong className="block mb-2">Sentry Event ID:</strong>
                      <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto border">
                        {eventId}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
            <p>If this problem persists, please contact our support team with the Error ID above.</p>
            <p className="mt-1">Email: support@coinwayfinder.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { RootErrorBoundary }
