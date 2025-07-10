import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("admin-token")

    return NextResponse.json({
      success: true,
      message: "Admin signed out successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Admin sign out failed" }, { status: 500 })
  }
}
