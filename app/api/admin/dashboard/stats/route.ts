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

    // Get user stats
    const [userStats] = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as active_users
      FROM users
    `

    // Get email stats (mock data for now)
    const emailStats = {
      emailsSentToday: 156,
      emailsFailedToday: 3,
    }

    // Get security stats
    const securityStats = {
      securityScore: 95,
      activeThreats: 0,
      blockedIPs: 0,
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
        const [auditStats] = await sql`
          SELECT 
            COUNT(CASE WHEN risk_level IN ('high', 'critical') AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as active_threats,
            COUNT(CASE WHEN event_type = 'rate_limit_exceeded' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as blocked_ips
          FROM audit_logs
        `

        securityStats.activeThreats = Number.parseInt(auditStats.active_threats) || 0
        securityStats.blockedIPs = Number.parseInt(auditStats.blocked_ips) || 0

        // Calculate security score based on recent activity
        const threatCount = securityStats.activeThreats
        if (threatCount > 10) securityStats.securityScore = 60
        else if (threatCount > 5) securityStats.securityScore = 75
        else if (threatCount > 0) securityStats.securityScore = 85
      }
    } catch (error) {
      console.error("Error fetching security stats:", error)
    }

    // Determine system health
    let systemHealth: "healthy" | "warning" | "critical" = "healthy"
    if (securityStats.activeThreats > 10 || emailStats.emailsFailedToday > 20) {
      systemHealth = "critical"
    } else if (securityStats.activeThreats > 5 || emailStats.emailsFailedToday > 10) {
      systemHealth = "warning"
    }

    const stats = {
      totalUsers: Number.parseInt(userStats.total_users) || 0,
      activeUsers: Number.parseInt(userStats.active_users) || 0,
      ...emailStats,
      ...securityStats,
      systemHealth,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
