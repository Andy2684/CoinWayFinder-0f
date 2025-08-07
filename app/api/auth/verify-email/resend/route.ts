import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendVerificationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

function generateVerificationToken() {
  return randomBytes(32).toString("hex")
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}))

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      // Don't leak existence
      return NextResponse.json({ success: true, message: "If an account exists, a new link was sent." })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: "Email already verified." })
    }

    // Light cooldown: 60 seconds between resends
    const now = new Date()
    const last = user.verificationLastSentAt ? new Date(user.verificationLastSentAt) : null
    if (last && now.getTime() - last.getTime() < 60_000) {
      const remaining = Math.ceil((60_000 - (now.getTime() - last.getTime())) / 1000)
      return NextResponse.json(
        { success: false, error: `Please wait ${remaining}s before requesting another email.` },
        { status: 429 },
      )
    }

    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken: token,
          verificationTokenExpiresAt: expiresAt,
          verificationLastSentAt: now,
          updated_at: now,
        },
      },
    )

    await sendVerificationEmail(user.email, token)

    return NextResponse.json({ success: true, message: "Verification email sent." })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
