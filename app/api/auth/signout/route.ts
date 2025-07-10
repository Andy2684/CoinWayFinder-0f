import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")

    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Sign out failed" }, { status: 500 })
  }
}
