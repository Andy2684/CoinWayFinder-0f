import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Verification token is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Find user with a valid (non-expired) token
    const user = await users.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Mark verified and clear token fields
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          updated_at: new Date(),
        },
        $unset: {
          verificationToken: "",
          verificationTokenExpiresAt: "",
          verificationLastSentAt: "",
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
