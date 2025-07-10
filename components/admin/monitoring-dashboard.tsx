"use client"

import React from "react"
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ErrorStats {
  totalErrors: number
  errorRate: number
  topErrors: Array<{
    message: string
    count: number
    lastSeen: string
  }>
  affectedUsers: number
}

export function MonitoringDashboard() {
  const [errorStats, setErrorStats] = React.useState<ErrorStats>({
    totalErrors: 0,
    errorRate: 0,
    topErrors: [],
    affectedUsers: 0,
  })

  React.useEffect(() => {
    // In a real implementation, this would fetch from Sentry API
    // For demo purposes, showing mock data
    setErrorStats({
      totalErrors: 23,
      errorRate: 0.12,
      topErrors: [
        {
          message: "Network request failed",
          count: 8,
          lastSeen: "2 minutes ago",
        },
        {
          message: "Bot execution timeout",
          count: 5,
          lastSeen: "15 minutes ago",
        },
        {
          message: "Invalid API response",
          count: 4,
          lastSeen: "1 hour ago",
        },
      ],
      affectedUsers: 12,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              {errorStats.errorRate > 0.1 ? (
                <span className="text-red-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+{(errorStats.errorRate * 100).toFixed(1)}% from yesterday
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />-{(errorStats.errorRate * 100).toFixed(1)}% from yesterday
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(errorStats.errorRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Of total requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.affectedUsers}</div>
            <p className="text-xs text-muted-foreground">Users experiencing errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Errors (Last 24 Hours)</CardTitle>
          <CardDescription>Most frequent errors reported by Sentry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorStats.topErrors.map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{error.message}</p>
                  <p className="text-xs text-muted-foreground">Last seen: {error.lastSeen}</p>
                </div>
                <Badge variant="secondary">{error.count} occurrences</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
