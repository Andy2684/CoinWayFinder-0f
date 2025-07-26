import { type NextRequest, NextResponse } from "next/server"
import { createUser, emailExists, usernameExists } from "@/lib/auth"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { email, password, firstName, lastName, username } = validationResult.data

    // Check if email already exists
    if (await emailExists(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
          message: "An account with this email already exists",
        },
        { status: 409 },
      )
    }

    // Check if username already exists (if provided)
    if (username && (await usernameExists(username))) {
      return NextResponse.json(
        {
          success: false,
          error: "Username already exists",
          message: "This username is already taken",
        },
        { status: 409 },
      )
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      username,
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now sign in.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during signup. Please try again.",
      },
      { status: 500 },
    )
  }
}
