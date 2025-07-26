"use client"

import { useState, useEffect, useCallback } from "react"

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

export function useSecurityData(refreshInterval = 30000) {
  const [data, setData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/security/live-stats")

      if (!response.ok) {
        throw new Error("Failed to fetch security data")
      }

      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        throw new Error(result.error || "Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching security data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}
