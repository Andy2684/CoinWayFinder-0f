import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin"

// Mock user data for admin panel
const mockUsers = [
  {
    id: "1",
    email: "user1@example.com",
    username: "trader_pro",
    subscription: "premium",
    activeBots: 5,
    totalTrades: 234,
    joinedAt: "2024-01-15",
    lastActive: "2024-01-20",
  },
  {
    id: "2",
    email: "user2@example.com",
    username: "crypto_whale",
    subscription: "basic",
    activeBots: 2,
    totalTrades: 89,
    joinedAt: "2024-01-10",
    lastActive: "2024-01-19",
  },
  {
    id: "3",
    email: "user3@example.com",
    username: "dca_master",
    subscription: "pro",
    activeBots: 8,
    totalTrades: 567,
    joinedAt: "2024-01-05",
    lastActive: "2024-01-20",
  },
]

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

    return NextResponse.json({
      users: mockUsers,
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter((u) => u.lastActive === "2024-01-20").length,
      premiumUsers: mockUsers.filter((u) => u.subscription === "premium" || u.subscription === "pro").length,
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
