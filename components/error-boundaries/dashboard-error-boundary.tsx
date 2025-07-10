"use client"

import type React from "react"
import { TrendingUp, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "../error-boundary"
import type { ErrorFallbackProps } from "../error-boundary"

const DashboardErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, errorId }) => {
  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-xl font-bold">Dashboard Temporarily Unavailable</CardTitle>
          <CardDescription>
            We're having trouble loading your dashboard data. This is likely a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Error ID: {errorId}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={resetError} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Dashboard
              </Button>
              <Button
                onClick={() => (window.location.href = "/bots")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Go to Bots
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={DashboardErrorFallback} resetOnPropsChange={true}>
      {children}
    </ErrorBoundary>
  )
}
