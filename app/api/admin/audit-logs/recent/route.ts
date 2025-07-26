import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getAuditLogs } from "@/lib/audit-logger"

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

    // Fetch recent events (last 20)
    const events = await getAuditLogs({
      limit: 20,
      offset: 0,
    })

    return NextResponse.json({
      success: true,
      events,
    })
  } catch (error) {
    console.error("Error fetching recent events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
