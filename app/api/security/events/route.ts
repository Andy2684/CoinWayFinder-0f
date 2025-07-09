import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor, SecurityEventType } from "@/lib/security-monitor"
import { authService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get("admin-token")?.value
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
    }

    const admin = await authService.verifyAdminToken(adminToken)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("type") as SecurityEventType
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const events = await securityMonitor.getSecurityEvents(eventType, limit * page)
    const paginatedEvents = events.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      status: "success",
      data: {
        events: paginatedEvents,
        pagination: {
          page,
          limit,
          total: events.length,
          hasMore: events.length > page * limit,
        },
        filters: {
          eventType: eventType || "all",
          availableTypes: Object.values(SecurityEventType),
        },
      },
    })
  } catch (error) {
    console.error("Security events error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch security events",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, severity, source, details, userAgent, ip, userId } = body

    await securityMonitor.logSecurityEvent({
      type,
      severity,
      source,
      details,
      userAgent,
      ip,
      userId,
    })

    return NextResponse.json({
      status: "success",
      message: "Security event logged successfully",
    })
  } catch (error) {
    console.error("Log security event error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to log security event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
