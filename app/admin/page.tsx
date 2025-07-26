"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useSecurityWebSocket } from "@/hooks/use-security-websocket"
import { SecurityConnectionStatus } from "@/components/admin/security-connection-status"
import { SecurityEventStream } from "@/components/admin/security-event-stream"
import { Shield, Users, Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [authToken, setAuthToken] = useState<string>("")

  // Get auth token from cookie for WebSocket connection
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1]

    if (token) {
      setAuthToken(token)
    }
  }, [])

  const { data: securityData, isConnected, connect, disconnect, lastUpdate } = useSecurityWebSocket(authToken)

  const handleManualRefresh = () => {
    disconnect()
    setTimeout(() => connect(), 100)
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getHealthStatus = () => {
    const { stats } = securityData
    const errorRate = stats.totalEvents > 0 ? (stats.failedEvents / stats.totalEvents) * 100 : 0

    if (errorRate < 5) return { status: "Healthy", color: "text-green-600", bgColor: "bg-green-100" }
    if (errorRate < 10) return { status: "Warning", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { status: "Critical", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const healthStatus = getHealthStatus()

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Real-time security monitoring and threat detection</p>
        </div>
        <div className="flex items-center gap-4">
          <SecurityConnectionStatus
            isConnected={isConnected}
            connectionStatus={securityData.connectionStatus}
            lastUpdate={lastUpdate}
            onReconnect={connect}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData.stats.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityData.stats.failedEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {securityData.stats.totalEvents > 0
                ? `${((securityData.stats.failedEvents / securityData.stats.totalEvents) * 100).toFixed(1)}% failure rate`
                : "No events recorded"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData.stats.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unique users (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus.color}`}>{healthStatus.status}</div>
            <p className="text-xs text-muted-foreground">Based on error rates</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Threat Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level</span>
                <Badge
                  className={`${
                    securityData.stats.criticalEvents > 0
                      ? "bg-red-500"
                      : securityData.stats.highRiskEvents > 0
                        ? "bg-orange-500"
                        : securityData.stats.failedEvents > 10
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  } text-white`}
                >
                  {securityData.stats.criticalEvents > 0
                    ? "CRITICAL"
                    : securityData.stats.highRiskEvents > 0
                      ? "HIGH"
                      : securityData.stats.failedEvents > 10
                        ? "MEDIUM"
                        : "LOW"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Critical Events</span>
                  <span className="font-medium text-red-600">{securityData.stats.criticalEvents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High Risk Events</span>
                  <span className="font-medium text-orange-600">{securityData.stats.highRiskEvents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Unique IPs</span>
                  <span className="font-medium">{securityData.stats.uniqueIps}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${healthStatus.bgColor}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <span className={`font-bold ${healthStatus.color}`}>{healthStatus.status}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Events (24h)</span>
                  <span className="font-medium">{securityData.stats.eventsLast24h}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Events (7d)</span>
                  <span className="font-medium">{securityData.stats.eventsLast7d}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Error Rate</span>
                  <span className="font-medium">
                    {securityData.stats.totalEvents > 0
                      ? `${((securityData.stats.failedEvents / securityData.stats.totalEvents) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Recent Alerts</span>
                  <span className="font-medium text-red-600">{securityData.alerts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recent Events</span>
                  <span className="font-medium">{securityData.recentEvents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Update</span>
                  <span className="font-medium text-xs">{lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityData.alerts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No security alerts in the last 24 hours</p>
                </div>
              ) : (
                securityData.alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-red-500 text-white text-xs">{alert.riskLevel.toUpperCase()}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {alert.email && <span>{alert.email}</span>}
                          {alert.ipAddress && <span>{alert.ipAddress}</span>}
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Event Stream */}
        <SecurityEventStream events={securityData.recentEvents} isLive={isConnected} />
      </div>
    </div>
  )
}
