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

    // Mock active sessions data (in production, this would come from session storage)
    const mockSessions = [
      {
        id: "sess_1",
        userId: "user_1",
        email: "john.doe@example.com",
        username: "johndoe",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: "New York, US",
        device: "Desktop",
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        duration: "2h 15m",
      },
      {
        id: "sess_2",
        userId: "user_2",
        email: "jane.smith@example.com",
        username: "janesmith",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        location: "London, UK",
        device: "Mobile",
        lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        duration: "45m",
      },
      {
        id: "sess_3",
        userId: "user_3",
        email: "admin@coinwayfinder.com",
        username: "admin",
        ipAddress: "172.16.0.10",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        location: "San Francisco, US",
        device: "Desktop",
        lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        duration: "4h 32m",
      },
    ]

    return NextResponse.json({
      success: true,
      sessions: mockSessions,
      total: mockSessions.length,
    })
  } catch (error) {
    console.error("Error fetching active sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
