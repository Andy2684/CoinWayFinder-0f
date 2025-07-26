"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface SecurityTrend {
  period: string
  loginAttempts: number
  failedLogins: number
  suspiciousActivity: number
  blockedIPs: number
}

export function SecurityTrendsWidget() {
  const [trends, setTrends] = useState<SecurityTrend[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrends = async () => {
    try {
      const response = await fetch("/api/admin/security/trends")
      if (response.ok) {
        const data = await response.json()
        setTrends(data.trends || [])
      }
    } catch (error) {
      console.error("Error fetching security trends:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()

    // Update every minute
    const interval = setInterval(fetchTrends, 60000)

    return () => clearInterval(interval)
  }, [])

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, direction: "stable" as const }
    const percentage = Math.round(((current - previous) / previous) * 100)
    const direction = percentage > 0 ? "up" : percentage < 0 ? "down" : "stable"
    return { percentage: Math.abs(percentage), direction }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return <Activity className="h-3 w-3 text-gray-500" />
    }
  }

  const getTrendColor = (direction: string, isGoodTrend = false) => {
    if (direction === "stable") return "text-gray-500"

    if (isGoodTrend) {
      return direction === "up" ? "text-green-600" : "text-red-600"
    } else {
      return direction === "up" ? "text-red-600" : "text-green-600"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Security Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Activity className="h-6 w-6 animate-pulse" />
            <span className="ml-2">Loading trends...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentTrend = trends[0]
  const previousTrend = trends[1]

  if (!currentTrend || !previousTrend) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Security Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Insufficient data</p>
            <p className="text-xs text-muted-foreground">Trends will appear after more activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const loginTrend = calculateTrend(currentTrend.loginAttempts, previousTrend.loginAttempts)
  const failedTrend = calculateTrend(currentTrend.failedLogins, previousTrend.failedLogins)
  const suspiciousTrend = calculateTrend(currentTrend.suspiciousActivity, previousTrend.suspiciousActivity)
  const blockedTrend = calculateTrend(currentTrend.blockedIPs, previousTrend.blockedIPs)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Security Trends
        </CardTitle>
        <p className="text-xs text-muted-foreground">Last hour vs previous hour</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Login Attempts */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Login Attempts</p>
            <p className="text-lg font-bold">{currentTrend.loginAttempts}</p>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor(loginTrend.direction, true)}`}>
            {getTrendIcon(loginTrend.direction)}
            <span className="text-sm font-medium">
              {loginTrend.percentage > 0 ? `${loginTrend.percentage}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Failed Logins */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Failed Logins</p>
            <p className="text-lg font-bold">{currentTrend.failedLogins}</p>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor(failedTrend.direction, false)}`}>
            {getTrendIcon(failedTrend.direction)}
            <span className="text-sm font-medium">
              {failedTrend.percentage > 0 ? `${failedTrend.percentage}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Suspicious Activity */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Suspicious Activity</p>
            <p className="text-lg font-bold">{currentTrend.suspiciousActivity}</p>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor(suspiciousTrend.direction, false)}`}>
            {getTrendIcon(suspiciousTrend.direction)}
            <span className="text-sm font-medium">
              {suspiciousTrend.percentage > 0 ? `${suspiciousTrend.percentage}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Blocked IPs */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Blocked IPs</p>
            <p className="text-lg font-bold">{currentTrend.blockedIPs}</p>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor(blockedTrend.direction, false)}`}>
            {getTrendIcon(blockedTrend.direction)}
            <span className="text-sm font-medium">
              {blockedTrend.percentage > 0 ? `${blockedTrend.percentage}%` : "0%"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
