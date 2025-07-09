import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, getAdminStats } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No admin token found" }, { status: 401 })
    }

    const admin = verifyAdminToken(token)

    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const stats = getAdminStats()

    return NextResponse.json({
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      stats,
      privileges: {
        unlimitedBots: true,
        unlimitedTrades: true,
        whaleTracking: true,
        newsAccess: true,
        userManagement: true,
        systemStats: true,
      },
    })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
