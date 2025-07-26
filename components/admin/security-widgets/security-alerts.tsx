"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, User, MapPin } from "lucide-react"

interface SecurityAlert {
  id: string
  event_type: string
  event_description: string
  risk_level: "low" | "medium" | "high" | "critical"
  created_at: string
  ip_address?: string
  email?: string
  username?: string
}

interface SecurityAlertsProps {
  data: SecurityAlert[]
  loading?: boolean
}

export function SecurityAlerts({ data, loading = false }: SecurityAlertsProps) {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
          </div>
          <Badge variant="secondary">{data.length} alerts</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No security alerts in the last 24 hours</p>
            </div>
          ) : (
            data.map((alert) => (
              <div key={alert.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getRiskLevelColor(alert.risk_level)}>
                    {getRiskLevelIcon(alert.risk_level)}
                    <span className="ml-1 capitalize">{alert.risk_level}</span>
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(alert.created_at)}</span>
                  </div>
                </div>

                <p className="text-sm font-medium mb-2">{alert.event_description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {alert.email && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{alert.email}</span>
                    </div>
                  )}
                  {alert.ip_address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.ip_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last 24 hours</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Live updates</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
