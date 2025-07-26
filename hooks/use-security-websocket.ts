"use client"

import { useEffect, useState, useCallback } from "react"
import { securityManager } from "@/lib/websocket-security-manager"

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
}

interface SecurityStats {
  totalEvents: number
  failedEvents: number
  highRiskEvents: number
  criticalEvents: number
  eventsLast24h: number
  eventsLast7d: number
  uniqueUsers: number
  uniqueIps: number
}

interface SecurityData {
  stats: SecurityStats
  alerts: SecurityEvent[]
  recentEvents: SecurityEvent[]
  connectionStatus: "connected" | "disconnected" | "reconnecting"
}

interface UseSecurityWebSocketReturn {
  data: SecurityData
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  lastUpdate: Date | null
}

export function useSecurityWebSocket(token?: string): UseSecurityWebSocketReturn {
  const [data, setData] = useState<SecurityData>({
    stats: {
      totalEvents: 0,
      failedEvents: 0,
      highRiskEvents: 0,
      criticalEvents: 0,
      eventsLast24h: 0,
      eventsLast7d: 0,
      uniqueUsers: 0,
      uniqueIps: 0,
    },
    alerts: [],
    recentEvents: [],
    connectionStatus: "disconnected",
  })
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const connect = useCallback(() => {
    if (token) {
      securityManager.connect(token)
    }
  }, [token])

  const disconnect = useCallback(() => {
    securityManager.disconnect()
  }, [])

  useEffect(() => {
    const unsubscribe = securityManager.addListener((newData) => {
      setData(newData)
      setIsConnected(newData.connectionStatus === "connected")
      setLastUpdate(new Date())
    })

    // Auto-connect if token is available
    if (token) {
      connect()
    }

    return () => {
      unsubscribe()
      disconnect()
    }
  }, [token, connect, disconnect])

  return {
    data,
    isConnected,
    connect,
    disconnect,
    lastUpdate,
  }
}
