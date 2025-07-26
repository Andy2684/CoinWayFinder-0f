import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getAuditLogStats, getSecurityAlerts, getTopEventTypes } from "@/lib/audit-logger"
import { sql } from "@/lib/database"

// Store active WebSocket connections
const connections = new Set<WebSocket>()

export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get("upgrade")
  if (upgrade !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 })
  }

  // Verify authentication
  const token = request.nextUrl.searchParams.get("token")
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return new Response("Invalid token", { status: 401 })
  }

  // For demo purposes, we'll simulate WebSocket upgrade
  // In production, you would use a proper WebSocket library like ws
  return new Response("WebSocket endpoint ready", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}

// Simulate WebSocket functionality for demo
export class SecurityWebSocketManager {
  private connections = new Map<string, any>()
  private intervals = new Map<string, NodeJS.Timeout>()

  connect(connectionId: string, onMessage: (data: any) => void) {
    // Simulate WebSocket connection
    const mockConnection = {
      id: connectionId,
      send: (data: string) => {
        // In real implementation, this would send to actual WebSocket
        console.log("Sending to WebSocket:", data)
      },
      close: () => {
        this.disconnect(connectionId)
      },
    }

    this.connections.set(connectionId, mockConnection)

    // Start sending real-time updates
    const interval = setInterval(async () => {
      try {
        const securityData = await this.getSecurityData()
        onMessage({
          type: "security_update",
          data: securityData,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error fetching security data for WebSocket:", error)
        onMessage({
          type: "error",
          error: "Failed to fetch security data",
          timestamp: new Date().toISOString(),
        })
      }
    }, 5000) // Update every 5 seconds for real-time feel

    this.intervals.set(connectionId, interval)

    // Send initial data
    this.getSecurityData().then((data) => {
      onMessage({
        type: "security_update",
        data,
        timestamp: new Date().toISOString(),
      })
    })

    return mockConnection
  }

  disconnect(connectionId: string) {
    const interval = this.intervals.get(connectionId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(connectionId)
    }
    this.connections.delete(connectionId)
  }

  private async getSecurityData() {
    const [stats, securityAlerts, topEventTypes] = await Promise.all([
      getAuditLogStats(),
      getSecurityAlerts(),
      getTopEventTypes(5),
    ])

    const recentFailedLogins = await this.getRecentFailedLogins()
    const activeThreats = await this.getActiveThreats()
    const systemHealth = await this.getSystemHealth()

    return {
      stats,
      securityAlerts,
      topEventTypes,
      recentFailedLogins,
      activeThreats,
      systemHealth,
    }
  }

  private async getRecentFailedLogins() {
    try {
      const [tableExists] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'audit_logs'
        )
      `

      if (!tableExists.exists) {
        return []
      }

      return await sql`
        SELECT 
          al.ip_address,
          al.metadata->>'email' as email,
          al.created_at,
          COUNT(*) as attempt_count
        FROM audit_logs al
        WHERE al.event_type = 'login_attempt'
          AND al.success = false
          AND al.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
        GROUP BY al.ip_address, al.metadata->>'email', al.created_at
        ORDER BY al.created_at DESC
        LIMIT 10
      `
    } catch (error) {
      console.error("Error fetching recent failed logins:", error)
      return []
    }
  }

  private async getActiveThreats() {
    try {
      const [tableExists] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'audit_logs'
        )
      `

      if (!tableExists.exists) {
        return {
          suspiciousIps: 0,
          rateLimitViolations: 0,
          unauthorizedAccess: 0,
          highRiskEvents: 0,
        }
      }

      const [threats] = await sql`
        SELECT 
          COUNT(DISTINCT CASE WHEN event_type = 'suspicious_activity' THEN ip_address END) as suspicious_ips,
          COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as rate_limit_violations,
          COUNT(CASE WHEN event_type = 'unauthorized_access' THEN 1 END) as unauthorized_access,
          COUNT(CASE WHEN risk_level = 'high' OR risk_level = 'critical' THEN 1 END) as high_risk_events
        FROM audit_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `

      return threats
    } catch (error) {
      console.error("Error fetching active threats:", error)
      return {
        suspiciousIps: 0,
        rateLimitViolations: 0,
        unauthorizedAccess: 0,
        highRiskEvents: 0,
      }
    }
  }

  private async getSystemHealth() {
    try {
      const [tableExists] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'audit_logs'
        )
      `

      if (!tableExists.exists) {
        return {
          status: "healthy",
          uptime: 100,
          errorRate: 0,
          responseTime: 0,
        }
      }

      const [health] = await sql`
        SELECT 
          CASE 
            WHEN COUNT(CASE WHEN success = false THEN 1 END) * 100.0 / COUNT(*) > 10 THEN 'critical'
            WHEN COUNT(CASE WHEN success = false THEN 1 END) * 100.0 / COUNT(*) > 5 THEN 'warning'
            ELSE 'healthy'
          END as status,
          ROUND(COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / COUNT(*), 2) as uptime,
          ROUND(COUNT(CASE WHEN success = false THEN 1 END) * 100.0 / COUNT(*), 2) as error_rate,
          ROUND(AVG(CASE WHEN metadata->>'responseTime' IS NOT NULL THEN (metadata->>'responseTime')::numeric END), 0) as response_time
        FROM audit_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
          AND event_category = 'api'
      `

      return {
        status: health?.status || "healthy",
        uptime: health?.uptime || 100,
        errorRate: health?.error_rate || 0,
        responseTime: health?.response_time || 0,
      }
    } catch (error) {
      console.error("Error fetching system health:", error)
      return {
        status: "healthy",
        uptime: 100,
        errorRate: 0,
        responseTime: 0,
      }
    }
  }
}

export const securityWSManager = new SecurityWebSocketManager()
