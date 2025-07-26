"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mail, AlertTriangle, CheckCircle, Clock, RefreshCw, TrendingDown } from "lucide-react"

interface QueueStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  successRate: number
  failureRate: number
  avgRetryAttempts: number
}

interface EmailQueueMonitorProps {
  refreshInterval?: number
}

export function EmailQueueMonitor({ refreshInterval = 30000 }: EmailQueueMonitorProps) {
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    successRate: 0,
    failureRate: 0,
    avgRetryAttempts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/admin/email-queue/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching queue stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    const interval = setInterval(fetchStats, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading queue statistics...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Queue Monitor</h3>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <Badge variant={stats.failed > 0 ? "destructive" : "default"}>
          {stats.failed > 0 ? "Issues Detected" : "All Systems Normal"}
        </Badge>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span className="font-medium">{stats.successRate}%</span>
            </div>
            <Progress value={stats.successRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.completed} successful</span>
              <span>{stats.failed} failed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
              Failure Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failureRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.failed} out of {stats.total} jobs failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
              Avg Retry Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgRetryAttempts}</div>
            <p className="text-xs text-muted-foreground">Average attempts for failed jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {stats.processing > 0 ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              ) : stats.failed > 0 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className="font-medium">
                {stats.processing > 0
                  ? `Processing ${stats.processing} jobs...`
                  : stats.failed > 0
                    ? `${stats.failed} jobs need attention`
                    : "All systems operational"}
              </span>
            </div>
            <Badge variant={stats.processing > 0 ? "default" : stats.failed > 0 ? "destructive" : "default"}>
              {stats.processing > 0 ? "Active" : stats.failed > 0 ? "Issues" : "Healthy"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
