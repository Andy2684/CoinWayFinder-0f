import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin"

export async function GET() {
  try {
    const admin = await AdminService.getCurrentAdmin()

    if (!admin) {
      return NextResponse.json({ success: false, message: "Not authenticated as admin" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error("Get admin error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
