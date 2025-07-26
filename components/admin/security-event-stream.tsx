"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Clock, User, MapPin } from "lucide-react"

interface SecurityEvent {
  id: string
  event_type: string
  event_category: string
  event_description: string
  risk_level: "low" | "medium" | "high" | "critical"
  created_at: string
  ip_address?: string
  email?: string
  success: boolean
}

interface SecurityEventStreamProps {
  events: SecurityEvent[]
  loading?: boolean
}

export function SecurityEventStream({ events, loading = false }: SecurityEventStreamProps) {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 10) return "Just now"
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return date.toLocaleTimeString()
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSuccessColor = (success: boolean) => {
    return success ? "text-green-600" : "text-red-600"
  }

  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Event Stream
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
            <Activity className="h-5 w-5" />
            Live Event Stream
          </div>
          <Badge variant="secondary" className="animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Waiting for security events...</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    event.risk_level === "critical" || event.risk_level === "high"
                      ? "border-l-red-500 bg-red-50"
                      : event.risk_level === "medium"
                        ? "border-l-yellow-500 bg-yellow-50"
                        : "border-l-gray-500 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskLevelColor(event.risk_level)}>{event.risk_level.toUpperCase()}</Badge>
                      <span className={`text-xs font-medium ${getSuccessColor(event.success)}`}>
                        {event.success ? "SUCCESS" : "FAILED"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(event.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium mb-2">{formatEventType(event.event_type)}</p>
                  <p className="text-xs text-muted-foreground mb-2">{event.event_description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {event.email && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{event.email}</span>
                      </div>
                    )}
                    {event.ip_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.ip_address}</span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {event.event_category}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Real-time events</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>WebSocket connected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
