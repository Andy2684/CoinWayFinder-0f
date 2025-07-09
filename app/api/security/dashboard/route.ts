import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor } from "../../../../lib/security-monitor"

export async function GET(request: NextRequest) {
  try {
    // Get security statistics
    const stats = await securityMonitor.getSecurityStats()

    // Get system health metrics
    const systemHealth = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      },
      cpu: {
        loadAverage: process.platform !== "win32" ? require("os").loadavg() : [0, 0, 0],
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    }

    // Generate security recommendations
    const recommendations = generateSecurityRecommendations(stats)

    const dashboardData = {
      threatLevel: stats.threatLevel,
      systemHealth,
      securityStats: {
        totalEvents: stats.totalEvents,
        eventsByType: stats.eventsByType,
        eventsBySeverity: stats.eventsBySeverity,
        activeAlerts: stats.activeAlerts.length,
      },
      recentEvents: stats.recentEvents.slice(0, 10), // Last 10 events
      activeAlerts: stats.activeAlerts,
      recommendations,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(dashboardData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("❌ Security dashboard error:", error)

    return NextResponse.json(
      {
        error: "Failed to load security dashboard",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function generateSecurityRecommendations(stats: any): string[] {
  const recommendations: string[] = []

  // Check threat level
  if (stats.threatLevel === "critical") {
    recommendations.push("🚨 CRITICAL: Immediate security review required")
    recommendations.push("🔒 Consider temporarily restricting access")
  } else if (stats.threatLevel === "high") {
    recommendations.push("⚠️ HIGH: Enhanced monitoring recommended")
    recommendations.push("🔍 Review recent security events")
  }

  // Check for specific event types
  if (stats.eventsByType.sql_injection_attempt > 0) {
    recommendations.push("🛡️ SQL injection attempts detected - review input validation")
  }

  if (stats.eventsByType.xss_attempt > 0) {
    recommendations.push("🔐 XSS attempts detected - review output encoding")
  }

  if (stats.eventsByType.failed_auth_attempts > 10) {
    recommendations.push("🔑 High authentication failures - consider account lockout policies")
  }

  if (stats.eventsByType.rate_limit_exceeded > 20) {
    recommendations.push("⚡ High rate limiting - review API usage patterns")
  }

  // Active alerts
  if (stats.activeAlerts.length > 0) {
    recommendations.push(`🚨 ${stats.activeAlerts.length} active security alerts require attention`)
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push("✅ Security posture looks good")
    recommendations.push("📊 Continue monitoring for anomalies")
    recommendations.push("🔄 Regular security reviews recommended")
  }

  return recommendations
}
