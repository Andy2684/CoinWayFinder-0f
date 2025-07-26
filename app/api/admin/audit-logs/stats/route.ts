import { type NextRequest, NextResponse } from "next/server"
import { getAuditLogStats, getTopEventTypes, getSecurityAlerts } from "@/lib/audit-logger"
import { verifyToken } from "@/lib/auth"

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

    // Fetch all stats in parallel
    const [stats, topEventTypes, securityAlerts] = await Promise.all([
      getAuditLogStats(),
      getTopEventTypes(10),
      getSecurityAlerts(),
    ])

    return NextResponse.json({
      success: true,
      stats,
      topEventTypes,
      securityAlerts,
    })
  } catch (error) {
    console.error("Error fetching audit log stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
