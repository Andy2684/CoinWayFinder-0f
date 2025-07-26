"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { Shield, AlertTriangle, CheckCircle, XCircle, User, Globe, Activity } from "lucide-react"

interface SecurityEvent {
  id: string
  type: string
  category: string
  description: string
  riskLevel: "low" | "medium" | "high" | "critical"
  timestamp: string
  userId?: string
  ipAddress?: string
  success: boolean
  email?: string
  username?: string
}

interface SecurityEventStreamProps {
  events: SecurityEvent[]
  isLive: boolean
}

export function SecurityEventStream({ events, isLive }: SecurityEventStreamProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
      default:
        return "bg-green-500 text-white"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <User className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "api":
        return <Globe className="h-4 w-4" />
      case "system":
        return <Activity className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSuccessIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Security Event Stream</CardTitle>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <Badge variant="destructive" className="text-xs">
                LIVE
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent security events</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    event.riskLevel === "critical" || event.riskLevel === "high"
                      ? "border-red-200 bg-red-50"
                      : event.riskLevel === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2 mt-0.5">
                        {getCategoryIcon(event.category)}
                        {getSuccessIcon(event.success)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getRiskColor(event.riskLevel)}`}>
                            {event.riskLevel.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {event.email && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {event.email}
                            </span>
                          )}
                          {event.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {event.ipAddress}
                            </span>
                          )}
                          <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
