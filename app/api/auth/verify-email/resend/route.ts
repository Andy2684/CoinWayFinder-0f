import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo-client"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email-verification"

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({} as { email?: string }))
    const normalized = String(email || "").trim().toLowerCase()

    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: "Please provide a valid email" }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection("users")

    const user = await users.findOne({ email: normalized })
    if (!user) {
      // Avoid user enumeration
      return NextResponse.json({ ok: true })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true })
    }

    // Lightweight cooldown: 60 seconds
    const now = new Date()
    if (user.lastVerificationSentAt && now.getTime() - new Date(user.lastVerificationSentAt).getTime() < 60_000) {
      return NextResponse.json({ error: "Please wait before requesting another email." }, { status: 429 })
    }

    const verificationToken = randomBytes(32).toString("hex")
    const verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken,
          verificationTokenExpiresAt,
          lastVerificationSentAt: now,
          updatedAt: now,
        },
      }
    )

    await sendVerificationEmail(normalized, verificationToken)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Resend verify email error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
