import { type NextRequest, NextResponse } from "next/server"
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

    // Mock real-time stats (in production, these would come from actual monitoring)
    const stats = {
      activeUsers: Math.floor(Math.random() * 50) + 20,
      totalSessions: Math.floor(Math.random() * 100) + 50,
      successRate: Math.floor(Math.random() * 10) + 90,
      threatLevel: "low" as const,
      eventsPerMinute: Math.floor(Math.random() * 20) + 5,
      systemLoad: Math.floor(Math.random() * 30) + 20,
      responseTime: Math.floor(Math.random() * 100) + 50,
      uptime: "15h 32m",
    }

    // Adjust threat level based on system conditions
    if (stats.systemLoad > 80 || stats.successRate < 85) {
      stats.threatLevel = "high"
    } else if (stats.systemLoad > 60 || stats.successRate < 95) {
      stats.threatLevel = "medium"
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching realtime stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
