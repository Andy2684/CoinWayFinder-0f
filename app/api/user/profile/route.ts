import { type NextRequest, NextResponse } from "next/server"
import { AuthManager } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = AuthManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const updated = await AuthManager.updateUser(decoded.userId, {
      name,
      email,
      updatedAt: new Date(),
    })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 })
  }
}
