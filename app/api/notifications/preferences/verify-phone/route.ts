import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get user preferences
    const preferences = await db.collection("user_notification_preferences").findOne({ user_id: user.id })

    if (!preferences) {
      return NextResponse.json({ error: "Preferences not found" }, { status: 404 })
    }

    // Check if code matches and hasn't expired
    if (preferences.phone_verification_code !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    if (preferences.phone_verification_expires && new Date() > new Date(preferences.phone_verification_expires)) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    // Mark phone as verified
    await db.collection("user_notification_preferences").updateOne(
      { user_id: user.id },
      {
        $set: {
          phone_verified: true,
          updated_at: new Date(),
        },
        $unset: {
          phone_verification_code: "",
          phone_verification_expires: "",
        },
      },
    )

    return NextResponse.json({ success: true, message: "Phone number verified successfully" })
  } catch (error) {
    console.error("Error verifying phone:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
