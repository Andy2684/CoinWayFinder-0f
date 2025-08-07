import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { sendVerificationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

const SignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((v) => /[A-Z]/.test(v), "Must include an uppercase letter")
    .refine((v) => /[a-z]/.test(v), "Must include a lowercase letter")
    .refine((v) => /\d/.test(v), "Must include a number")
    .refine((v) => /[!@#$%^&*]/.test(v), "Must include a special character (!@#$%^&*)"),
})

function hashPasswordBcrypt(password: string) {
  // Lazy import to keep route load light
  const bcrypt = require("bcryptjs") as typeof import("bcryptjs")
  return bcrypt.hash(password, 12)
}

function generateVerificationToken() {
  return randomBytes(32).toString("hex")
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = SignupSchema.safeParse(json)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid request"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    // Unique email check
    const existing = await users.findOne({ email: parsed.data.email })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Create user with email verification fields
    const passwordHash = await hashPasswordBcrypt(parsed.data.password)
    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

    const now = new Date()
    const userDoc = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      username: parsed.data.email.split("@")[0],
      passwordHash,
      role: "user" as const,
      plan: "free" as const,
      isEmailVerified: false,
      // email verification fields
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
      verificationLastSentAt: now,
      // extras (consistent with your data model)
      profile: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        avatar: null as string | null,
        dateOfBirth: null as Date | null,
      },
      settings: {
        notifications: true,
        theme: "dark" as const,
        language: "en",
      },
      onboarding: {
        completed: false,
        currentStep: 0,
        completedSteps: [] as string[],
      },
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

    // Send verification email
    await sendVerificationEmail(parsed.data.email, token)

    // Set a short-lived cookie to show email and allow resend on the thank-you page
    const res = NextResponse.json(
      {
        success: true,
        userId: insert.insertedId.toString(),
        message: "Account created. Please verify your email to continue.",
      },
      { status: 201 }
    )

    // Cookie lives for 30 minutes; HttpOnly to keep it server-only by default
    res.cookies.set("pending_verification_email", parsed.data.email, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
      secure: true,
    })

    return res
  } catch (err: any) {
    // Standardize DB unavailability message for UX
    if (typeof err?.message === "string" && err.message.toLowerCase().includes("failed to connect")) {
      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }
    console.error("Signup error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
