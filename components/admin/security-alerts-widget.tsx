"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, Eye, Clock, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SecurityAlert {
  id: string
  event_type: string
  event_description: string
  risk_level: "low" | "medium" | "high" | "critical"
  created_at: string
  ip_address?: string
  user_id?: string
  email?: string
  username?: string
}

export function SecurityAlertsWidget() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/admin/security/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching security alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()

    // Poll for updates every 15 seconds
    const interval = setInterval(fetchAlerts, 15000)

    return () => clearInterval(interval)
  }, [])

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const criticalCount = alerts.filter((alert) => alert.risk_level === "critical").length
  const highCount = alerts.filter((alert) => alert.risk_level === "high").length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Security Alerts</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={fetchAlerts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {(criticalCount > 0 || highCount > 0) && (
              <Badge variant="destructive">{criticalCount + highCount} urgent</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Last 24 hours • Updated {formatTimeAgo(lastUpdated.toISOString())}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading alerts...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Shield className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-green-600">No security alerts</p>
            <p className="text-xs text-muted-foreground">All systems secure</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">{getRiskBadge(alert.risk_level)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.event_description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      {alert.email && (
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {alert.email}
                        </span>
                      )}
                      {alert.ip_address && <span>{alert.ip_address}</span>}
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(alert.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {alerts.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
              <a href="/admin/audit-logs?category=security">View All Security Events</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
