import { type NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const admin = await AdminService.validateAdminCredentials(username, password)

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set admin cookie
    await AdminService.setAdminCookie(admin)

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Admin signin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
