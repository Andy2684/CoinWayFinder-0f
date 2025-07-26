import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getSecurityAlerts } from "@/lib/audit-logger"

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

    // Fetch security alerts
    const alerts = await getSecurityAlerts()

    return NextResponse.json({
      success: true,
      alerts,
    })
  } catch (error) {
    console.error("Error fetching security alerts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
