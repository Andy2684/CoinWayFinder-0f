import { type NextRequest, NextResponse } from "next/server"
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

    const { phoneNumber } = await request.json()

    // In a real implementation, you would send an SMS with a verification code
    // using a service like Twilio. For demo purposes, we'll just return success
    console.log(`Sending verification code to ${phoneNumber}`)

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      // In demo, tell user the code is 123456
      demoCode: "123456",
    })
  } catch (error) {
    console.error("Send verification error:", error)
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
  }
}
