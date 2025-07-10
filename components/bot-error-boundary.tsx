"use client"

import type React from "react"
import { Bot, RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "./error-boundary"

interface BotErrorFallbackProps {
  error: Error
  reset: () => void
}

export function BotErrorFallback({ error, reset }: BotErrorFallbackProps) {
  const isApiError = error.message.includes("API") || error.message.includes("fetch")
  const isConfigError = error.message.includes("config") || error.message.includes("settings")

  return (
    <div className="container mx-auto p-6">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Bot className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Bot Management Error</CardTitle>
          <CardDescription>
            {isApiError && "Unable to connect to trading APIs"}
            {isConfigError && "Bot configuration error detected"}
            {!isApiError && !isConfigError && "An error occurred while managing your bots"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            {isApiError && (
              <div className="text-sm text-muted-foreground">
                <p>• Check your API key configuration</p>
                <p>• Verify exchange connectivity</p>
                <p>• Ensure sufficient permissions</p>
              </div>
            )}

            {isConfigError && (
              <div className="text-sm text-muted-foreground">
                <p>• Review bot strategy settings</p>
                <p>• Check trading pair configuration</p>
                <p>• Verify risk management parameters</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Bot Operations
              </Button>
              {(isApiError || isConfigError) && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => (window.location.href = "/integrations")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Check Configuration
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BotErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={BotErrorFallback}>{children}</ErrorBoundary>
}
