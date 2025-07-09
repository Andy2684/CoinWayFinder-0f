import { type NextRequest, NextResponse } from "next/server"
import { AdminAuth, getSystemStats } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = AdminAuth.verifyToken(token)

    if (!admin || !AdminAuth.hasPermission(admin, "user_management")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get system statistics
    const stats = await getSystemStats()

    // Mock user data - replace with real database queries
    const users = [
      {
        id: "1",
        email: "user1@example.com",
        subscription: "premium",
        botsCount: 5,
        tradesCount: 123,
        joinedAt: "2024-01-15",
        lastActive: "2024-01-20",
      },
      {
        id: "2",
        email: "user2@example.com",
        subscription: "basic",
        botsCount: 2,
        tradesCount: 45,
        joinedAt: "2024-01-18",
        lastActive: "2024-01-19",
      },
      {
        id: "admin-1",
        email: "project.command.center@gmail.com",
        subscription: "admin",
        botsCount: 999,
        tradesCount: 9999,
        joinedAt: "2024-01-01",
        lastActive: new Date().toISOString().split("T")[0],
      },
    ]

    return NextResponse.json({
      stats,
      users,
      adminInfo: {
        email: admin.email,
        permissions: admin.permissions,
        hasUnlimitedAccess: true,
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
