"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Users, AlertTriangle, TrendingUp, Activity, Shield, Globe, RefreshCw } from "lucide-react"
import { SecurityAlertsWidget } from "@/components/admin/security-alerts-widget"
import { RealtimeStatsWidget } from "@/components/admin/realtime-stats-widget"
import { ThreatDetectionWidget } from "@/components/admin/threat-detection-widget"
import { ActiveSessionsWidget } from "@/components/admin/active-sessions-widget"
import { SecurityTrendsWidget } from "@/components/admin/security-trends-widget"
import { RecentEventsWidget } from "@/components/admin/recent-events-widget"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  emailsSentToday: number
  emailsFailedToday: number
  systemHealth: "healthy" | "warning" | "critical"
  securityScore: number
  activeThreats: number
  blockedIPs: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    emailsSentToday: 0,
    emailsFailedToday: 0,
    systemHealth: "healthy",
    securityScore: 95,
    activeThreats: 0,
    blockedIPs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminStats()

    // Set up polling for real-time updates
    const interval = setInterval(fetchAdminStats, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and security monitoring
            <span className="ml-2 text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchAdminStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {getHealthBadge(stats.systemHealth)}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeUsers}</span> active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(stats.securityScore)}`}>
              {stats.securityScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeThreats > 0 ? (
                <span className="text-red-600">{stats.activeThreats} active threats</span>
              ) : (
                <span className="text-green-600">No active threats</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Status</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.emailsSentToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.emailsFailedToday > 0 ? (
                <span className="text-red-600">{stats.emailsFailedToday} failed</span>
              ) : (
                <span className="text-green-600">All delivered</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">Automatically blocked today</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityAlertsWidget />
        <RealtimeStatsWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ThreatDetectionWidget />
        <ActiveSessionsWidget />
        <SecurityTrendsWidget />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEventsWidget />

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Email Service</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Security System</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Trading Engine</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
              <a href="/admin/audit-logs">
                <Shield className="h-6 w-6 mb-2 text-blue-600" />
                <span className="font-medium">Audit Logs</span>
              </a>
            </Button>

            <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
              <a href="/admin/users">
                <Users className="h-6 w-6 mb-2 text-green-600" />
                <span className="font-medium">Manage Users</span>
              </a>
            </Button>

            <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
              <a href="/admin/email-queue">
                <Mail className="h-6 w-6 mb-2 text-purple-600" />
                <span className="font-medium">Email Queue</span>
              </a>
            </Button>

            <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
              <a href="/admin/security">
                <AlertTriangle className="h-6 w-6 mb-2 text-red-600" />
                <span className="font-medium">Security Alerts</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
