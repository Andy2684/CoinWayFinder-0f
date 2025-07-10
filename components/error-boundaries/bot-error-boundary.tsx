"use client"

import type React from "react"
import { RefreshCw, AlertTriangle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "../error-boundary"
import type { ErrorFallbackProps } from "../error-boundary"

const BotErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, errorId }) => {
  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-bold">Bot Management Error</CardTitle>
          <CardDescription>
            There was an issue with the bot management system. Your bots are still running safely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Error ID: {errorId}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={resetError} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Bot Panel
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const BotErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={BotErrorFallback} resetOnPropsChange={true}>
      {children}
    </ErrorBoundary>
  )
}
