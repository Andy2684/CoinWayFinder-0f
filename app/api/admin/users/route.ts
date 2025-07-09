import { type NextRequest, NextResponse } from "next/server"
import { adminManager, requirePermission } from "@/lib/admin"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const adminSession = adminManager.verifyAdminToken(token)

    if (!requirePermission(adminSession, "view_all_users")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    // Get all users with their stats
    const users = await database.getAllUsers() // You'll need to implement this
    const userStats = []

    for (const user of users) {
      const bots = await database.getUserBots(user._id!.toString())
      const trades = await database.getUserTrades(user._id!.toString(), 10)
      const settings = await database.getUserSettings(user._id!.toString())

      userStats.push({
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isVerified: user.isVerified,
        subscription: settings?.subscription || null,
        stats: {
          totalBots: bots.length,
          activeBots: bots.filter((b) => b.status === "running").length,
          totalTrades: trades.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      users: userStats,
      total: userStats.length,
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
