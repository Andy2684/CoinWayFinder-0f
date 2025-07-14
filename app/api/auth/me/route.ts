import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Find user by ID
      const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1)

      if (!user.length) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      const foundUser = user[0]

      // Check if user is active
      if (!foundUser.isActive) {
        return NextResponse.json({ success: false, error: "Account is deactivated" }, { status: 401 })
      }

      // Remove password from user object
      const { passwordHash: _, ...userWithoutPassword } = foundUser

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      })
    } catch (jwtError) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
