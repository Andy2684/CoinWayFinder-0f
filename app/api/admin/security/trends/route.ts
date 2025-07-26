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

    const trends = [
      {
        period: "current_hour",
        loginAttempts: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedIPs: 0,
      },
      {
        period: "previous_hour",
        loginAttempts: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedIPs: 0,
      },
    ]

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
        // Get current hour stats
        const [currentHour] = await sql`
          SELECT 
            COUNT(CASE WHEN event_type = 'login_attempt' THEN 1 END) as login_attempts,
            COUNT(CASE WHEN event_type = 'login_attempt' AND success = false THEN 1 END) as failed_logins,
            COUNT(CASE WHEN event_type = 'suspicious_activity' THEN 1 END) as suspicious_activity,
            COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as blocked_ips
          FROM audit_logs
          WHERE created_at >= date_trunc('hour', CURRENT_TIMESTAMP)
        `

        // Get previous hour stats
        const [previousHour] = await sql`
          SELECT 
            COUNT(CASE WHEN event_type = 'login_attempt' THEN 1 END) as login_attempts,
            COUNT(CASE WHEN event_type = 'login_attempt' AND success = false THEN 1 END) as failed_logins,
            COUNT(CASE WHEN event_type = 'suspicious_activity' THEN 1 END) as suspicious_activity,
            COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as blocked_ips
          FROM audit_logs
          WHERE created_at >= date_trunc('hour', CURRENT_TIMESTAMP) - INTERVAL '1 hour'
            AND created_at < date_trunc('hour', CURRENT_TIMESTAMP)
        `

        trends[0] = {
          period: "current_hour",
          loginAttempts: Number.parseInt(currentHour.login_attempts) || 0,
          failedLogins: Number.parseInt(currentHour.failed_logins) || 0,
          suspiciousActivity: Number.parseInt(currentHour.suspicious_activity) || 0,
          blockedIPs: Number.parseInt(currentHour.blocked_ips) || 0,
        }

        trends[1] = {
          period: "previous_hour",
          loginAttempts: Number.parseInt(previousHour.login_attempts) || 0,
          failedLogins: Number.parseInt(previousHour.failed_logins) || 0,
          suspiciousActivity: Number.parseInt(previousHour.suspicious_activity) || 0,
          blockedIPs: Number.parseInt(previousHour.blocked_ips) || 0,
        }
      }
    } catch (error) {
      console.error("Error fetching security trends:", error)
    }

    return NextResponse.json({
      success: true,
      trends,
    })
  } catch (error) {
    console.error("Error fetching security trends:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
