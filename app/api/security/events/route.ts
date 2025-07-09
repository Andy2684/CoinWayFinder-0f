import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor, SecurityEventType } from "../../../../lib/security-monitor"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as SecurityEventType | null
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // Get security events
    const allEvents = await securityMonitor.getSecurityEvents(type || undefined, limit * page)
    const startIndex = (page - 1) * limit
    const events = allEvents.slice(startIndex, startIndex + limit)

    // Get summary statistics
    const stats = await securityMonitor.getSecurityStats()

    const response = {
      events,
      pagination: {
        page,
        limit,
        total: allEvents.length,
        hasMore: allEvents.length > startIndex + limit,
      },
      summary: {
        totalEvents: stats.totalEvents,
        eventsByType: stats.eventsByType,
        eventsBySeverity: stats.eventsBySeverity,
        threatLevel: stats.threatLevel,
      },
      filters: {
        type: type || "all",
        availableTypes: Object.values(SecurityEventType),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("❌ Security events API error:", error)

    return NextResponse.json(
      {
        error: "Failed to load security events",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, alertId } = body

    if (action === "resolve_alert" && alertId) {
      const resolved = await securityMonitor.resolveAlert(alertId)

      if (resolved) {
        return NextResponse.json({
          success: true,
          message: "Alert resolved successfully",
          timestamp: new Date().toISOString(),
        })
      } else {
        return NextResponse.json(
          {
            error: "Failed to resolve alert",
            message: "Alert not found or already resolved",
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Invalid action",
        message: "Supported actions: resolve_alert",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("❌ Security events POST error:", error)

    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
