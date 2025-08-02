"use server"

import { redirect } from "next/navigation"
import { createUser, getUserByEmail } from "@/lib/auth"
import { cookies } from "next/headers"

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Validate input
  if (!email || !username || !password) {
    return { error: "All fields are required" }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" }
  }

  // Validate password requirements
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { error: "Password must contain at least one lowercase letter" }
  }

  if (!/\d/.test(password)) {
    return { error: "Password must contain at least one number" }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { error: "Password must contain at least one special character" }
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    // Create user
    const user = await createUser({
      email,
      username,
      password,
      isEmailVerified: false,
    })

    // Set success cookie
    const cookieStore = await cookies()
    cookieStore.set("signup-success", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
    })

    // Redirect to thank you page
    redirect("/thank-you")
  } catch (error) {
    console.error("Signup error:", error)

    if (error instanceof Error) {
      if (
        error.message.includes("Unable to connect to database") ||
        error.message.includes("EBADNAME") ||
        error.message.includes("getaddrinfo ENOTFOUND")
      ) {
        return { error: "Unable to connect to database. Please try again later." }
      }

      if (error.message.includes("duplicate key") || error.message.includes("E11000")) {
        return { error: "An account with this email or username already exists" }
      }
    }

    return { error: "Internal server error. Please try again later." }
  }
}
