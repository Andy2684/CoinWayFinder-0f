import { type NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin"

export async function POST(request: NextRequest) {
  try {
    await AdminService.clearAdminCookie()

    return NextResponse.json({
      success: true,
      message: "Admin signed out successfully",
    })
  } catch (error) {
    console.error("Admin signout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
