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

    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-$$$$]+$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiration time (10 minutes from now)
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000)

    // Update preferences with verification code
    await db.collection("user_notification_preferences").updateOne(
      { user_id: user.id },
      {
        $set: {
          phone_number: phoneNumber,
          phone_verification_code: verificationCode,
          phone_verification_expires: expirationTime,
          phone_verified: false,
          updated_at: new Date(),
        },
      },
      { upsert: true },
    )

    // In a real implementation, you would send the SMS here
    // For demo purposes, we'll just log it
    console.log(`SMS verification code for ${phoneNumber}: ${verificationCode}`)

    // For demo purposes, always use code "123456"
    await db.collection("user_notification_preferences").updateOne(
      { user_id: user.id },
      {
        $set: {
          phone_verification_code: "123456",
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      // In demo mode, return the code
      demoCode: "123456",
    })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
