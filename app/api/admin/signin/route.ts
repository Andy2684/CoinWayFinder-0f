import { type NextRequest, NextResponse } from "next/server"
import { adminManager } from "@/lib/admin"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password required" }, { status: 400 })
    }

    const admin = await adminManager.authenticateAdmin(username, password)

    if (!admin) {
      return NextResponse.json({ success: false, error: "Invalid admin credentials" }, { status: 401 })
    }

    const token = adminManager.generateAdminToken(admin)

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    })

    // Set admin token as HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin signin error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
