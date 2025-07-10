import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await authService.verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Admin authentication failed" }, { status: 500 })
  }
}
