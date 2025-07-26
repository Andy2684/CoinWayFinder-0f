"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { wsSecurityManager } from "@/lib/websocket-security-manager"

interface SecurityData {
  stats: {
    total_events: number
    failed_events: number
    high_risk_events: number
    critical_events: number
    events_last_24h: number
    events_last_7d: number
    unique_users: number
    unique_ips: number
  }
  securityAlerts: Array<{
    id: string
    event_type: string
    event_description: string
    risk_level: "low" | "medium" | "high" | "critical"
    created_at: string
    ip_address?: string
    email?: string
    username?: string
  }>
  topEventTypes: Array<{
    event_type: string
    event_category: string
    count: number
    failed_count: number
  }>
  recentFailedLogins: Array<{
    ip_address: string
    email: string
    created_at: string
    attempt_count: number
  }>
  activeThreats: {
    suspiciousIps: number
    rateLimitViolations: number
    unauthorizedAccess: number
    highRiskEvents: number
  }
  systemHealth: {
    status: "healthy" | "warning" | "critical"
    uptime: number
    errorRate: number
    responseTime: number
  }
  timestamp: string
}

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

export function useSecurityWebSocket(token?: string) {
  const [data, setData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const connectionIdRef = useRef<string>("")
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const handleMessage = useCallback(
    (message: any) => {
      try {
        setLastUpdate(message.timestamp)

        switch (message.type) {
          case "security_update":
            setData(message.data)
            setLoading(false)
            setError(null)
            break

          case "security_event":
            const newEvent = message.data as SecurityEvent
            setRecentEvents((prev) => [newEvent, ...prev.slice(0, 9)]) // Keep last 10 events

            // Update relevant data based on event type
            if (data) {
              setData((prevData) => {
                if (!prevData) return prevData

                const updatedData = { ...prevData }

                // Update stats
                updatedData.stats = {
                  ...updatedData.stats,
                  total_events: updatedData.stats.total_events + 1,
                  failed_events: newEvent.success
                    ? updatedData.stats.failed_events
                    : updatedData.stats.failed_events + 1,
                  high_risk_events:
                    newEvent.risk_level === "high" || newEvent.risk_level === "critical"
                      ? updatedData.stats.high_risk_events + 1
                      : updatedData.stats.high_risk_events,
                  critical_events:
                    newEvent.risk_level === "critical"
                      ? updatedData.stats.critical_events + 1
                      : updatedData.stats.critical_events,
                  events_last_24h: updatedData.stats.events_last_24h + 1,
                }

                // Add to security alerts if high risk
                if (newEvent.risk_level === "high" || newEvent.risk_level === "critical") {
                  updatedData.securityAlerts = [
                    {
                      id: newEvent.id,
                      event_type: newEvent.event_type,
                      event_description: newEvent.event_description,
                      risk_level: newEvent.risk_level,
                      created_at: newEvent.created_at,
                      ip_address: newEvent.ip_address,
                      email: newEvent.email,
                    },
                    ...updatedData.securityAlerts.slice(0, 9),
                  ]
                }

                return updatedData
              })
            }
            break

          case "health_update":
            if (data) {
              setData((prevData) =>
                prevData
                  ? {
                      ...prevData,
                      systemHealth: message.data.systemHealth,
                    }
                  : prevData,
              )
            }
            break

          case "threat_update":
            if (data) {
              setData((prevData) =>
                prevData
                  ? {
                      ...prevData,
                      activeThreats: message.data.activeThreats,
                    }
                  : prevData,
              )
            }
            break

          case "error":
            setError(message.error)
            break

          default:
            console.log("Unknown message type:", message.type)
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err)
        setError("Error processing real-time data")
      }
    },
    [data],
  )

  const handleConnect = useCallback(() => {
    setConnected(true)
    setError(null)
    console.log("Security WebSocket connected")
  }, [])

  const handleDisconnect = useCallback(() => {
    setConnected(false)
    console.log("Security WebSocket disconnected")
  }, [])

  const handleError = useCallback((error: Event) => {
    setError("WebSocket connection error")
    setConnected(false)
    console.error("Security WebSocket error:", error)
  }, [])

  const connect = useCallback(() => {
    if (!token) {
      setError("Authentication token required")
      return
    }

    if (connectionIdRef.current) {
      wsSecurityManager.disconnect(connectionIdRef.current)
    }

    const connectionId = wsSecurityManager.connect(token, handleMessage, handleError, handleConnect, handleDisconnect)

    if (connectionId) {
      connectionIdRef.current = connectionId
    } else {
      setError("Failed to establish WebSocket connection")
    }
  }, [token, handleMessage, handleError, handleConnect, handleDisconnect])

  const disconnect = useCallback(() => {
    if (connectionIdRef.current) {
      wsSecurityManager.disconnect(connectionIdRef.current)
      connectionIdRef.current = ""
    }
    setConnected(false)
  }, [])

  const reconnect = useCallback(() => {
    disconnect()

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    // Attempt reconnection after a short delay
    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, 1000)
  }, [connect, disconnect])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect, disconnect])

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!connected && !loading && data) {
      console.log("Connection lost, attempting to reconnect...")
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnect()
      }, 5000) // Reconnect after 5 seconds
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connected, loading, data, reconnect])

  return {
    data,
    loading,
    error,
    connected,
    recentEvents,
    lastUpdate,
    reconnect,
    disconnect,
  }
}
