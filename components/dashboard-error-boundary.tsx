"use client"

import type React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "react-error-boundary" // Import ErrorBoundary

interface DashboardErrorFallbackProps {
  error: Error
  reset: () => void
}

export function DashboardErrorFallback({ error, reset }: DashboardErrorFallbackProps) {
  return (
    <div className="container mx-auto p-6">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Dashboard Error</CardTitle>
          <CardDescription>Unable to load dashboard data. This might be a temporary issue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              We're having trouble connecting to our trading services. Your funds and bots are safe.
            </p>
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={DashboardErrorFallback}>{children}</ErrorBoundary>
}
