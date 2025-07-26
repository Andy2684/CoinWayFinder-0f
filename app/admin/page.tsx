"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Activity, AlertTriangle, RefreshCw, Database, Mail, Settings, BarChart3 } from "lucide-react"

// Security Widgets
import { ThreatMonitor } from "@/components/admin/security-widgets/threat-monitor"
import { FailedLogins } from "@/components/admin/security-widgets/failed-logins"
import { SystemHealth } from "@/components/admin/security-widgets/system-health"
import { SecurityAlerts } from "@/components/admin/security-widgets/security-alerts"
import { LiveActivity } from "@/components/admin/security-widgets/live-activity"

// WebSocket Components
import { SecurityConnectionStatus } from "@/components/admin/security-connection-status"
import { SecurityEventStream } from "@/components/admin/security-event-stream"

// Hooks
import { useSecurityWebSocket } from "@/hooks/use-security-websocket"
import { useAuth } from "@/hooks/use-auth"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [authToken, setAuthToken] = useState<string>("")

  // Get auth token for WebSocket connection
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1]

    if (token) {
      setAuthToken(token)
    }
  }, [])

  const {
    data: securityData,
    loading: securityLoading,
    error: securityError,
    connected,
    recentEvents,
    lastUpdate,
    reconnect,
  } = useSecurityWebSocket(authToken)

  const handleRefresh = () => {
    reconnect()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need to be logged in to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time security monitoring and system administration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={securityLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${securityLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <SecurityConnectionStatus
        connected={connected}
        lastUpdate={lastUpdate}
        onReconnect={reconnect}
        loading={securityLoading}
      />

      {/* Error Display */}
      {securityError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Connection Error:</span>
              <span>{securityError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData?.stats.total_events.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">{securityData?.stats.events_last_24h || 0} in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityData?.stats.failed_events.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">{securityData?.stats.high_risk_events || 0} high risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData?.stats.unique_users.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">{securityData?.stats.unique_ips || 0} unique IPs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  securityData?.systemHealth.status === "healthy"
                    ? "default"
                    : securityData?.systemHealth.status === "warning"
                      ? "secondary"
                      : "destructive"
                }
              >
                {securityData?.systemHealth.status || "Unknown"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{securityData?.systemHealth.uptime || 0}% uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security Monitor</TabsTrigger>
          <TabsTrigger value="events">Live Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          {/* Security Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ThreatMonitor
              data={
                securityData?.activeThreats || {
                  suspiciousIps: 0,
                  rateLimitViolations: 0,
                  unauthorizedAccess: 0,
                  highRiskEvents: 0,
                }
              }
              loading={securityLoading}
            />
            <SystemHealth
              data={
                securityData?.systemHealth || {
                  status: "healthy",
                  uptime: 100,
                  errorRate: 0,
                  responseTime: 0,
                }
              }
              loading={securityLoading}
            />
            <LiveActivity data={securityData?.topEventTypes || []} loading={securityLoading} />
          </div>

          {/* Detailed Security Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SecurityAlerts data={securityData?.securityAlerts || []} loading={securityLoading} />
            <FailedLogins data={securityData?.recentFailedLogins || []} loading={securityLoading} />
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SecurityEventStream events={recentEvents} loading={securityLoading} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Event Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Events Today</span>
                    <span className="font-medium">{securityData?.stats.events_last_24h || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Events This Week</span>
                    <span className="font-medium">{securityData?.stats.events_last_7d || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Critical Events</span>
                    <span className="font-medium text-red-600">{securityData?.stats.critical_events || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {securityData?.stats.total_events
                        ? Math.round(
                            ((securityData.stats.total_events - securityData.stats.failed_events) /
                              securityData.stats.total_events) *
                              100,
                          )
                        : 100}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Security Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced analytics and trend analysis coming soon...</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed data insights and reporting features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security configuration and alert settings coming soon...</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Email and notification preferences coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
