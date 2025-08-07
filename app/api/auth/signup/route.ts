import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { getCollection, initializeDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

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
    .refine((v) => /[!@#$%^&*]/.test(v), "Must include a special character"),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = SignupSchema.safeParse(json)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid request"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Ensure DB indexes exist (idempotent)
    await initializeDatabase()
    const users = await getCollection("users")

    const existing = await users.findOne({ email: parsed.data.email })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    const now = new Date()
    const userDoc = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      profile: {
        displayName: `${parsed.data.firstName} ${parsed.data.lastName}`,
        avatarUrl: null as string | null,
      },
      preferences: {
        marketingEmails: false,
      },
      // no dashboard/profile redirect flags needed; frontend shows thank-you
    }

    const insert = await users.insertOne(userDoc)

    return NextResponse.json(
      {
        success: true,
        userId: insert.insertedId,
        message: "Account created successfully",
      },
      { status: 201 }
    )
  } catch (err: any) {
    // Standardize DB unavailability message for UX
    if (typeof err?.message === "string" && err.message.toLowerCase().includes("failed to connect")) {
      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
