import { type NextRequest, NextResponse } from "next/server"
import { AuthManager } from "@/lib/auth"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = AuthManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const settings = await database.getUserSettings(decoded.userId)

    if (!settings) {
      // Create default settings if they don't exist
      const newSettings = await database.createUserWithTrial(decoded.userId)
      return NextResponse.json({ settings: newSettings })
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 })
  }
}
