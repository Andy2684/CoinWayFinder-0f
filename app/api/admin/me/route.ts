import { type NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const admin = await AdminService.getCurrentAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.adminId,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
