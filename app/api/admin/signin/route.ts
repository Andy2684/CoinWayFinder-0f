import { type NextRequest, NextResponse } from "next/server"
import { validateAdminCredentials, generateAdminToken } from "@/lib/admin"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const admin = await validateAdminCredentials(username, password)

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateAdminToken(admin)

    const response = NextResponse.json({
      success: true,
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Admin signin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
