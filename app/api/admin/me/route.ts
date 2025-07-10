import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)

    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get current admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
