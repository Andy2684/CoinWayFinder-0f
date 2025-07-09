import { type NextRequest, NextResponse } from "next/server"
import { adminManager } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "No admin token" }, { status: 401 })
    }

    const adminSession = adminManager.verifyAdminToken(token)

    if (!adminSession) {
      return NextResponse.json({ success: false, error: "Invalid admin token" }, { status: 401 })
    }

    const stats = adminManager.getAdminStats()

    return NextResponse.json({
      success: true,
      admin: adminSession,
      stats,
    })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
