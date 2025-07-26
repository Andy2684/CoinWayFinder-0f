"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThreatMonitor } from "@/components/admin/security-widgets/threat-monitor"
import { FailedLogins } from "@/components/admin/security-widgets/failed-logins"
import { SystemHealth } from "@/components/admin/security-widgets/system-health"
import { SecurityAlerts } from "@/components/admin/security-widgets/security-alerts"
import { LiveActivity } from "@/components/admin/security-widgets/live-activity"
import { useSecurityData } from "@/hooks/use-security-data"
import { Users, AlertTriangle, CheckCircle, Activity, RefreshCw, Shield } from "lucide-react"

export default function AdminDashboard() {
  const { data: securityData, loading, error, refetch } = useSecurityData(30000) // 30 second refresh
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    if (securityData) {
      setLastRefresh(new Date(securityData.timestamp))
    }
  }, [securityData])

  const getHealthBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const handleRefresh = () => {
    refetch()
    setLastRefresh(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and security monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</div>
          <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {securityData && getHealthBadge(securityData.systemHealth.status)}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading dashboard data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData?.stats.unique_users || 0}</div>
            <p className="text-xs text-muted-foreground">Active in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{securityData?.stats.events_last_24h || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityData?.stats.failed_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              {securityData?.stats.total_events
                ? `${Math.round((securityData.stats.failed_events / securityData.stats.total_events) * 100)}% failure rate`
                : "0% failure rate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-lg font-semibold">
                {securityData?.systemHealth.status === "healthy" ? "Operational" : "Issues"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{securityData?.systemHealth.uptime || 100}% uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ThreatMonitor
          data={
            securityData?.activeThreats || {
              suspiciousIps: 0,
              rateLimitViolations: 0,
              unauthorizedAccess: 0,
              highRiskEvents: 0,
            }
          }
          loading={loading}
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
          loading={loading}
        />

        <LiveActivity data={securityData?.topEventTypes || []} loading={loading} />
      </div>

      {/* Security Alerts and Failed Logins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityAlerts data={securityData?.securityAlerts || []} loading={loading} />

        <FailedLogins data={securityData?.recentFailedLogins || []} loading={loading} />
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Real-time system metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Events</span>
                <span className="text-2xl font-bold">{securityData?.stats.total_events || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last 7 days</span>
                <span className="text-sm font-medium">{securityData?.stats.events_last_7d || 0}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Risk Events</span>
                <span className="text-2xl font-bold text-orange-600">{securityData?.stats.high_risk_events || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Critical Events</span>
                <span className="text-sm font-medium text-red-600">{securityData?.stats.critical_events || 0}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unique IPs</span>
                <span className="text-2xl font-bold">{securityData?.stats.unique_ips || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="text-sm font-medium">{securityData?.stats.unique_users || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
