import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import { getAuditLogStats, getTopEventTypes, getSecurityAlerts } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Get user and check admin role
    const user = await getUserById(decoded.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    // Get statistics
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
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
