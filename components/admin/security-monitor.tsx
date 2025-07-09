"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, Shield, AlertTriangle, Activity, Eye } from "lucide-react"

interface SecurityEvent {
  id: string
  type: string
  severity: string
  timestamp: string
  source: string
  details: any
  ip?: string
  userAgent?: string
}

interface SecurityStats {
  totalEvents: number
  eventsByType: Record<string, number>
  recentEvents: SecurityEvent[]
}

interface SecurityDashboard {
  threatLevel: string
  systemHealth: any
  statistics: SecurityStats
  recentEvents: SecurityEvent[]
  alerts: {
    active: SecurityEvent[]
    resolved: SecurityEvent[]
  }
  recommendations: string[]
}

export function SecurityMonitor() {
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null)
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/security/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboard(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch security dashboard:", error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/security/events?limit=100")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.data.events)
      }
    } catch (error) {
      console.error("Failed to fetch security events:", error)
    }
  }

  useEffect(() => {
    fetchDashboard()
    fetchEvents()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboard()
      fetchEvents()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Monitor</h2>
        </div>
        <Button onClick={fetchDashboard} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Threat Level Alert */}
      {dashboard && dashboard.threatLevel !== "low" && (
        <Alert variant={dashboard.threatLevel === "critical" ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Threat Level: {dashboard.threatLevel.toUpperCase()}</AlertTitle>
          <AlertDescription>
            Elevated security activity detected. Review recent events and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getThreatLevelColor(dashboard?.threatLevel || "unknown")}>
              {dashboard?.threatLevel?.toUpperCase() || "UNKNOWN"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.statistics?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard?.alerts?.active?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{dashboard?.systemHealth?.status?.toUpperCase() || "UNKNOWN"}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security events and incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                        <div>
                          <p className="font-medium">{event.type.replace(/_/g, " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.source} • {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.alerts?.active?.length === 0 ? (
                <p className="text-muted-foreground">No active alerts</p>
              ) : (
                <div className="space-y-2">
                  {dashboard?.alerts?.active?.map((alert) => (
                    <Alert key={alert.id} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{alert.type.replace(/_/g, " ")}</AlertTitle>
                      <AlertDescription>
                        {alert.source} • {new Date(alert.timestamp).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
              <CardDescription>Breakdown of security events by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboard?.statistics?.eventsByType &&
                  Object.entries(dashboard.statistics.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm">{type.replace(/_/g, " ")}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>Suggested actions to improve security posture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboard?.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
