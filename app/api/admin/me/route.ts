import { type NextRequest, NextResponse } from "next/server"
import { AdminAuth } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = AdminAuth.verifyToken(token)

    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
