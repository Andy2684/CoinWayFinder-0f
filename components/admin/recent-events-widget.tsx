"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, User, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface RecentEvent {
  id: string
  event_type: string
  event_category: string
  event_description: string
  risk_level: "low" | "medium" | "high" | "critical"
  success: boolean
  created_at: string
  user_id?: string
  email?: string
  username?: string
  ip_address?: string
}

export function RecentEventsWidget() {
  const [events, setEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/audit-logs/recent")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Error fetching recent events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()

    // Update every 10 seconds
    const interval = setInterval(fetchEvents, 10000)

    return () => clearInterval(interval)
  }, [])

  const getEventIcon = (category: string, success: boolean) => {
    if (!success) return <AlertTriangle className="h-4 w-4 text-red-500" />

    switch (category) {
      case "authentication":
        return <User className="h-4 w-4 text-blue-500" />
      case "security":
        return <Shield className="h-4 w-4 text-orange-500" />
      case "system":
        return <Activity className="h-4 w-4 text-green-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Low</Badge>
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <Activity className="h-6 w-6 animate-pulse" />
            <span className="ml-2">Loading recent events...</span>
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
            <Activity className="h-5 w-5 mr-2 text-green-500" />
            Recent Events
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Latest system activity</p>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No recent events</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">{getEventIcon(event.event_category, event.success)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-foreground">{event.event_description}</p>
                      {event.risk_level !== "low" && <div className="ml-2">{getRiskBadge(event.risk_level)}</div>}
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                      {event.email && <span>{event.email}</span>}
                      {event.ip_address && <span className="font-mono">{event.ip_address}</span>}
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(event.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {events.length > 0 && (
          <div className="mt-4 pt-3 border-t text-center">
            <a href="/admin/audit-logs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Events →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
