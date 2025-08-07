import { NextResponse } from "next/server"

type Body = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push("Password must be at least 8 characters long")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter")
  if (!/\d/.test(password)) errors.push("Password must contain at least one number")
  if (!/[!@#$%^&*]/.test(password)) errors.push("Password must contain at least one special character (!@#$%^&*)")
  return errors
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const { firstName, lastName, email, password } = body

    // Basic validation similar to production
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }
    const pwErrors = validatePassword(password)
    if (pwErrors.length > 0) {
      return NextResponse.json({ error: pwErrors.join(". ") }, { status: 400 })
    }

    // Simulate a small delay
    await new Promise((r) => setTimeout(r, 300))

    // Always succeed for the test
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully (mock)",
        user: {
          id: "test-user-id",
          firstName,
          lastName,
          email: email.toLowerCase(),
          username: email.toLowerCase().split("@")[0],
          role: "user",
          plan: "free",
          isEmailVerified: false,
        },
      },
      { status: 201 },
    )
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Use POST for testing signup" })
}
