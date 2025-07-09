import { type NextRequest, NextResponse } from "next/server"
import { adminManager, requirePermission } from "@/lib/admin"

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

    // Mock user data - in production, fetch from database
    const mockUsers = [
      {
        id: "user-001",
        email: "john.doe@example.com",
        name: "John Doe",
        createdAt: new Date("2024-01-15"),
        lastLoginAt: new Date("2024-01-20"),
        isVerified: true,
        subscription: {
          plan: "premium",
          status: "active",
          endDate: new Date("2024-02-15"),
        },
        stats: {
          totalBots: 5,
          activeBots: 3,
          totalTrades: 127,
          totalProfit: 2450.75,
        },
      },
      {
        id: "user-002",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        createdAt: new Date("2024-01-10"),
        lastLoginAt: new Date("2024-01-19"),
        isVerified: true,
        subscription: {
          plan: "basic",
          status: "active",
          endDate: new Date("2024-02-10"),
        },
        stats: {
          totalBots: 2,
          activeBots: 1,
          totalTrades: 45,
          totalProfit: 890.25,
        },
      },
      {
        id: "user-003",
        email: "mike.wilson@example.com",
        name: "Mike Wilson",
        createdAt: new Date("2024-01-05"),
        lastLoginAt: new Date("2024-01-18"),
        isVerified: false,
        subscription: {
          plan: "free",
          status: "active",
          endDate: new Date("2024-02-05"),
        },
        stats: {
          totalBots: 1,
          activeBots: 0,
          totalTrades: 8,
          totalProfit: 125.5,
        },
      },
    ]

    return NextResponse.json({
      success: true,
      users: mockUsers,
      total: mockUsers.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value
    const adminSession = adminManager.verifyAdminToken(token || "")

    if (!requirePermission(adminSession, "manage_users")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const { action, userId, data } = await request.json()

    switch (action) {
      case "suspend":
        // Suspend user account
        return NextResponse.json({
          success: true,
          message: `User ${userId} suspended successfully`,
        })

      case "activate":
        // Activate user account
        return NextResponse.json({
          success: true,
          message: `User ${userId} activated successfully`,
        })

      case "upgrade":
        // Upgrade user subscription
        return NextResponse.json({
          success: true,
          message: `User ${userId} upgraded to ${data.plan}`,
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin user management error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
