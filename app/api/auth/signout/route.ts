import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST() {
  try {
    await AuthService.signOut()
    return NextResponse.json({ success: true, message: "Signed out successfully" })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ success: false, message: "Failed to sign out" }, { status: 500 })
  }
}
