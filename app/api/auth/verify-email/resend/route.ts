import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { randomBytes } from "crypto"

function generateToken() {
  return randomBytes(32).toString("hex")
}

async function sendVerificationEmail(request: NextRequest, to: string, token: string) {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || request.headers.get("origin") || request.nextUrl.origin
    const verifyLink = `${base}/auth/verify-email?token=${encodeURIComponent(token)}`
    const subject = "Verify your CoinWayFinder email"
    const html = `
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyLink}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `
    await fetch(`${base}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    }).catch(() => {})
  } catch (e) {
    console.warn("resend sendVerificationEmail failed:", e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || "").toLowerCase().trim()
    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    if (user.isEmailVerified) {
      return NextResponse.json({ success: false, error: "Email already verified" }, { status: 400 })
    }

    // Cooldown: 60 seconds between sends
    const lastSent = user.verificationLastSentAt ? new Date(user.verificationLastSentAt).getTime() : 0
    if (Date.now() - lastSent < 60_000) {
      return NextResponse.json({ success: false, error: "Please wait before requesting another email" }, { status: 429 })
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h

    await users.updateOne(
      { _id: user._id },
      { $set: { verificationToken: token, verificationTokenExpiresAt: expiresAt, verificationLastSentAt: new Date() } }
    )

    await sendVerificationEmail(request, email, token)
    return NextResponse.json({ success: true, message: "Verification email resent" })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
