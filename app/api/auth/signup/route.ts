import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb } from "@/lib/mongo-client"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email-verification"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    const firstName = String(body?.firstName || "").trim()
    const lastName = String(body?.lastName || "").trim()
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "")

    // Basic validations
    if (!firstName || firstName.length < 2) {
      return NextResponse.json({ error: "First name must be at least 2 characters" }, { status: 400 })
    }
    if (!lastName || lastName.length < 2) {
      return NextResponse.json({ error: "Last name must be at least 2 characters" }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email" }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection("users")

    const existing = await users.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = randomBytes(32).toString("hex")
    const verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    const now = new Date()

    await users.insertOne({
      firstName,
      lastName,
      email,
      passwordHash,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
      lastVerificationSentAt: now,
      createdAt: now,
      updatedAt: now,
    })

    // Attempt to send verification email (do not fail signup if email fails)
    await sendVerificationEmail(email, verificationToken)

    // Set a short-lived cookie so /thank-you can offer "Resend"
    cookies().set("pending_verification_email", email, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Signup error:", err)
    if ((err?.message || "").includes("ECONNREFUSED")) {
      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
