"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Shield } from "lucide-react"

interface RealtimeStats {
  activeUsers: number
  totalSessions: number
  successRate: number
  threatLevel: "low" | "medium" | "high" | "critical"
  eventsPerMinute: number
  systemLoad: number
  responseTime: number
  uptime: string
}

export function RealtimeStatsWidget() {
  const [stats, setStats] = useState<RealtimeStats>({
    activeUsers: 0,
    totalSessions: 0,
    successRate: 0,
    threatLevel: "low",
    eventsPerMinute: 0,
    systemLoad: 0,
    responseTime: 0,
    uptime: "0h 0m",
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/realtime/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching realtime stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Update every 5 seconds for real-time feel
    const interval = setInterval(fetchStats, 5000)

    return () => clearInterval(interval)
  }, [])

  const getThreatBadge = (level: string) => {
    switch (level) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
    }
  }

  const getProgressColor = (value: number, threshold = 80) => {
    if (value >= threshold) return "bg-red-500"
    if (value >= threshold * 0.7) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Real-time Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <Activity className="h-6 w-6 animate-pulse" />
            <span className="ml-2">Loading real-time data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Real-time Statistics
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Users */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{stats.activeUsers}</div>
            <div className="text-xs text-muted-foreground">{stats.totalSessions} sessions</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Success Rate</span>
            <span className="text-sm font-bold">{stats.successRate}%</span>
          </div>
          <Progress value={stats.successRate} className="h-2" />
        </div>

        {/* System Load */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Load</span>
            <span className="text-sm font-bold">{stats.systemLoad}%</span>
          </div>
          <Progress value={stats.systemLoad} className="h-2" />
        </div>

        {/* Threat Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Threat Level</span>
          </div>
          {getThreatBadge(stats.threatLevel)}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.eventsPerMinute}</div>
            <div className="text-xs text-muted-foreground">Events/min</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.responseTime}ms</div>
            <div className="text-xs text-muted-foreground">Avg response</div>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">System Uptime</span>
          <span className="text-sm font-bold text-green-600">{stats.uptime}</span>
        </div>
      </CardContent>
    </Card>
  )
}
