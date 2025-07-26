"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SecurityConnectionStatusProps {
  isConnected: boolean
  connectionStatus: "connected" | "disconnected" | "reconnecting"
  lastUpdate: Date | null
  onReconnect: () => void
}

export function SecurityConnectionStatus({
  isConnected,
  connectionStatus,
  lastUpdate,
  onReconnect,
}: SecurityConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "reconnecting":
        return "bg-yellow-500"
      case "disconnected":
      default:
        return "bg-red-500"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live"
      case "reconnecting":
        return "Reconnecting"
      case "disconnected":
      default:
        return "Disconnected"
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4" />
      case "reconnecting":
        return <RotateCcw className="h-4 w-4 animate-spin" />
      case "disconnected":
      default:
        return <WifiOff className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isConnected ? "animate-pulse" : ""}`} />
        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>

      {lastUpdate && (
        <span className="text-sm text-muted-foreground">
          Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </span>
      )}

      {!isConnected && (
        <Button variant="outline" size="sm" onClick={onReconnect} className="flex items-center gap-1 bg-transparent">
          <RotateCcw className="h-3 w-3" />
          Reconnect
        </Button>
      )}
    </div>
  )
}
