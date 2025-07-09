import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin"

export async function GET() {
  try {
    // Require admin authentication
    await AdminService.requireAdmin()

    // Get all users (this would need to be implemented in database)
    // For now, return mock data
    const users = [
      {
        id: "1",
        email: "user1@example.com",
        name: "User 1",
        subscription: { plan: "free", status: "active" },
        createdAt: new Date(),
      },
      {
        id: "2",
        email: "user2@example.com",
        name: "User 2",
        subscription: { plan: "premium", status: "active" },
        createdAt: new Date(),
      },
    ]

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
  }
}
