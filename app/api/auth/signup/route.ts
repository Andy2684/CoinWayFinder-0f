import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { randomBytes } from "crypto"

// Minimal password checks to match client UI requirements
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push("Password must be at least 8 characters long")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter")
  if (!/\d/.test(password)) errors.push("Password must contain at least one number")
  if (!/[!@#$%^&*]/.test(password)) errors.push("Password must contain at least one special character (!@#$%^&*)")
  return { isValid: errors.length === 0, errors }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 12)
}

function generateVerificationToken() {
  return randomBytes(32).toString("hex")
}

function absoluteUrl(request: NextRequest, path: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    `${request.nextUrl.protocol}//${request.headers.get("host")}`
  return `${base}${path}`
}

async function sendVerificationEmail(request: NextRequest, to: string, token: string) {
  try {
    const verifyLink = absoluteUrl(request, `/auth/verify-email?token=${encodeURIComponent(token)}`)
    const subject = "Verify your CoinWayFinder email"
    const html = `
      <p>Welcome to CoinWayFinder!</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyLink}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `
    // If you have an internal email route, call it here. Fail-soft if not configured.
    const base =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || request.headers.get("origin") || request.nextUrl.origin
    const url = `${base}/api/send-email`
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    }).catch(() => {})
  } catch (e) {
    // Do not fail signup because of email send failure
    console.warn("sendVerificationEmail failed:", e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body || {}

    // Validate inputs
    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
      return NextResponse.json({ error: "First name must be at least 2 characters long" }, { status: 400 })
    }
    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2) {
      return NextResponse.json({ error: "Last name must be at least 2 characters long" }, { status: 400 })
    }
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }
    const pw = validatePassword(password)
    if (!pw.isValid) {
      return NextResponse.json({ error: pw.errors.join(". ") }, { status: 400 })
    }

    // Lazy DB connect at runtime (won't run during build)
    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const emailNorm = String(email).toLowerCase().trim()
    const exists = await users.findOne({ email: emailNorm })
    if (exists) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    const now = new Date()

    const userDoc = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: emailNorm,
      username: emailNorm.split("@")[0],
      passwordHash,
      role: "user" as const,
      plan: "free" as const,
      isEmailVerified: false,
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
      verificationLastSentAt: now,
      profile: { firstName: String(firstName).trim(), lastName: String(lastName).trim(), avatar: null, dateOfBirth: null },
      settings: { notifications: true, theme: "dark" as const, language: "en" },
      onboarding: { completed: false, currentStep: 0, completedSteps: [] as string[] },
      achievements: [] as string[],
      tradingPreferences: {
        riskTolerance: "medium" as const,
        tradingExperience: "beginner" as const,
        preferredAssets: [] as string[],
        maxInvestmentAmount: null as number | null,
      },
      created_at: now,
      updated_at: now,
    }

    const insert = await users.insertOne(userDoc)
    if (!insert.insertedId) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    await sendVerificationEmail(request, emailNorm, token)

    const res = NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email.",
        user: {
          id: insert.insertedId.toString(),
          email: emailNorm,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
        },
      },
      { status: 201 }
    )

    // Set a cookie for thank-you page to show email and enable "Resend" quickly
    res.cookies.set("pending_verification_email", emailNorm, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: 60 * 30, // 30 minutes
    })

    return res
  } catch (error: unknown) {
    console.error("Signup error:", error)
    if (error instanceof Error && (error.message.includes("EBADNAME") || error.message.includes("querySrv"))) {
      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
