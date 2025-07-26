import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
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

    const threats = {
      suspiciousIPs: 0,
      blockedAttempts: 0,
      riskScore: 15,
      activeThreats: [] as Array<{
        type: string
        count: number
        severity: "low" | "medium" | "high" | "critical"
      }>,
      recentBlocks: [] as Array<{
        ip: string
        reason: string
        timestamp: string
      }>,
    }

    try {
      // Check if audit_logs table exists
      const [tableExists] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'audit_logs'
        )
      `

      if (tableExists.exists) {
        // Get threat statistics from audit logs
        const [threatStats] = await sql`
          SELECT 
            COUNT(DISTINCT ip_address) as suspicious_ips,
            COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as blocked_attempts,
            COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_events,
            COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_events
          FROM audit_logs
          WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
            AND (risk_level IN ('high', 'critical') OR event_type = 'rate_limit_exceeded')
        `

        threats.suspiciousIPs = Number.parseInt(threatStats.suspicious_ips) || 0
        threats.blockedAttempts = Number.parseInt(threatStats.blocked_attempts) || 0

        // Calculate risk score
        const highRisk = Number.parseInt(threatStats.high_risk_events) || 0
        const criticalRisk = Number.parseInt(threatStats.critical_events) || 0
        threats.riskScore = Math.min(100, 15 + highRisk * 5 + criticalRisk * 15)

        // Get active threat types
        const threatTypes = await sql`
          SELECT 
            event_type,
            COUNT(*) as count,
            CASE 
              WHEN risk_level = 'critical' THEN 'critical'
              WHEN risk_level = 'high' THEN 'high'
              WHEN risk_level = 'medium' THEN 'medium'
              ELSE 'low'
            END as severity
          FROM audit_logs
          WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
            AND risk_level IN ('medium', 'high', 'critical')
          GROUP BY event_type, risk_level
          ORDER BY count DESC
          LIMIT 5
        `

        threats.activeThreats = threatTypes.map((threat) => ({
          type: threat.event_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          count: Number.parseInt(threat.count),
          severity: threat.severity as "low" | "medium" | "high" | "critical",
        }))

        // Get recent blocks
        const recentBlocks = await sql`
          SELECT 
            ip_address,
            event_description,
            created_at
          FROM audit_logs
          WHERE event_type = 'rate_limit_exceeded'
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
          ORDER BY created_at DESC
          LIMIT 5
        `

        threats.recentBlocks = recentBlocks.map((block) => ({
          ip: block.ip_address || "Unknown",
          reason: block.event_description,
          timestamp: block.created_at,
        }))
      }
    } catch (error) {
      console.error("Error fetching threat data:", error)
    }

    return NextResponse.json({
      success: true,
      threats,
    })
  } catch (error) {
    console.error("Error fetching threat data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
