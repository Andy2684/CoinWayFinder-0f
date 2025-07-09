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

    // Get security statistics
    const stats = await securityMonitor.getSecurityStats()
    const recentEvents = await securityMonitor.getSecurityEvents(undefined, 50)

    // Calculate threat level
    const threatLevel = calculateThreatLevel(stats)

    // Get system health
    const systemHealth = await getSystemHealth()

    const dashboardData = {
      timestamp: new Date().toISOString(),
      threatLevel,
      systemHealth,
      statistics: stats,
      recentEvents,
      alerts: {
        active: getActiveAlerts(recentEvents),
        resolved: getResolvedAlerts(),
      },
      recommendations: generateSecurityRecommendations(stats, recentEvents),
    }

    return NextResponse.json({
      status: "success",
      data: dashboardData,
    })
  } catch (error) {
    console.error("Security dashboard error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to load security dashboard",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function calculateThreatLevel(stats: any): string {
  if (!stats) return "unknown"

  const criticalEvents = stats.eventsByType[SecurityEventType.SQL_INJECTION_ATTEMPT] || 0
  const highEvents =
    (stats.eventsByType[SecurityEventType.UNAUTHORIZED_ACCESS] || 0) +
    (stats.eventsByType[SecurityEventType.API_ABUSE] || 0)

  if (criticalEvents > 0) return "critical"
  if (highEvents > 10) return "high"
  if (stats.totalEvents > 100) return "medium"
  return "low"
}

async function getSystemHealth(): Promise<any> {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    status: "healthy",
  }
}

function getActiveAlerts(events: any[]): any[] {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  return events
    .filter((event) => new Date(event.timestamp).getTime() > oneHourAgo)
    .filter((event) =>
      [
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        SecurityEventType.XSS_ATTEMPT,
        SecurityEventType.UNAUTHORIZED_ACCESS,
      ].includes(event.type),
    )
    .slice(0, 10)
}

function getResolvedAlerts(): any[] {
  // Mock resolved alerts - in production, this would come from database
  return []
}

function generateSecurityRecommendations(stats: any, events: any[]): string[] {
  const recommendations: string[] = []

  if (stats?.eventsByType[SecurityEventType.RATE_LIMIT_EXCEEDED] > 10) {
    recommendations.push("Consider implementing stricter rate limiting")
  }

  if (stats?.eventsByType[SecurityEventType.CSP_VIOLATION] > 20) {
    recommendations.push("Review and tighten Content Security Policy")
  }

  if (stats?.eventsByType[SecurityEventType.FAILED_AUTH_ATTEMPTS] > 50) {
    recommendations.push("Implement account lockout after failed attempts")
  }

  if (recommendations.length === 0) {
    recommendations.push("Security posture is good - continue monitoring")
  }

  return recommendations
}
