import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin"

export async function POST() {
  try {
    await AdminService.adminSignOut()
    return NextResponse.json({ success: true, message: "Admin signed out successfully" })
  } catch (error) {
    console.error("Admin signout error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
