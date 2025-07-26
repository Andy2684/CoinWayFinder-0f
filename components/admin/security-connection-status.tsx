"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react"

interface SecurityConnectionStatusProps {
  connected: boolean
  lastUpdate: string
  onReconnect: () => void
  loading?: boolean
}

export function SecurityConnectionStatus({
  connected,
  lastUpdate,
  onReconnect,
  loading = false,
}: SecurityConnectionStatusProps) {
  const formatLastUpdate = (timestamp: string) => {
    if (!timestamp) return "Never"

    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 10) return "Just now"
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {connected ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
          <Badge variant={connected ? "default" : "destructive"}>{connected ? "Connected" : "Disconnected"}</Badge>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last update: {formatLastUpdate(lastUpdate)}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onReconnect}
        disabled={loading}
        className="flex items-center gap-2 bg-transparent"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Connecting..." : "Reconnect"}
      </Button>
    </div>
  )
}
