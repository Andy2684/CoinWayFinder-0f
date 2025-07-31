import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { phoneNumber, verificationCode } = await request.json()

    // In a real implementation, you would verify the code with a service like Twilio
    // For demo purposes, we'll accept "123456" as a valid code
    if (verificationCode === "123456") {
      await sql`
        UPDATE user_notification_preferences 
        SET phone_verified = true, phone_number = ${phoneNumber}
        WHERE user_id = ${decoded.userId}
      `

      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully",
      })
    } else {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }
  } catch (error) {
    console.error("Phone verification error:", error)
    return NextResponse.json({ error: "Failed to verify phone number" }, { status: 500 })
  }
}
