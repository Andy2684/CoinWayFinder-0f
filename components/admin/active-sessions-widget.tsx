"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Globe, Clock, Smartphone, Monitor } from "lucide-react"

interface ActiveSession {
  id: string
  userId: string
  email: string
  username?: string
  ipAddress: string
  userAgent: string
  location?: string
  device: string
  lastActivity: string
  duration: string
}

export function ActiveSessionsWidget() {
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSessions, setTotalSessions] = useState(0)

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/sessions/active")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        setTotalSessions(data.total || 0)
      }
    } catch (error) {
      console.error("Error fetching active sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()

    // Update every 30 seconds
    const interval = setInterval(fetchSessions, 30000)

    return () => clearInterval(interval)
  }, [])

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile") || device.toLowerCase().includes("phone")) {
      return <Smartphone className="h-3 w-3" />
    }
    return <Monitor className="h-3 w-3" />
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    return `${Math.floor(diffInMinutes / 60)}h ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Users className="h-6 w-6 animate-pulse" />
            <span className="ml-2">Loading sessions...</span>
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
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Active Sessions
          </CardTitle>
          <Badge variant="secondary">{totalSessions} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No active sessions</p>
          </div>
        ) : (
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="flex items-start space-x-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">{getDeviceIcon(session.device)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{session.username || session.email}</p>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(session.lastActivity)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="font-mono">{session.ipAddress}</span>
                      {session.location && <span>• {session.location}</span>}
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Duration: {session.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {sessions.length > 0 && (
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Showing {Math.min(sessions.length, 10)} of {totalSessions} active sessions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
