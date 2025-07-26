import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getAuditLogStats, getSecurityAlerts, getTopEventTypes } from "@/lib/audit-logger"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get real-time security statistics
    const [stats, securityAlerts, topEventTypes] = await Promise.all([
      getAuditLogStats(),
      getSecurityAlerts(),
      getTopEventTypes(5),
    ])

    // Get recent failed login attempts
    const recentFailedLogins = await getRecentFailedLogins()

    // Get active threats count
    const activeThreats = await getActiveThreats()

    // Get system health metrics
    const systemHealth = await getSystemHealth()

    return NextResponse.json({
      success: true,
      data: {
        stats,
        securityAlerts,
        topEventTypes,
        recentFailedLogins,
        activeThreats,
        systemHealth,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching live security stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getRecentFailedLogins() {
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

async function getActiveThreats() {
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

async function getSystemHealth() {
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
        uptime: "100%",
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
      uptime: "100%",
      errorRate: 0,
      responseTime: 0,
    }
  }
}
