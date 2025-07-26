import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip !== "unknown" ? ip : ""
  }
  if (realIP && realIP !== "unknown") {
    return realIP
  }
  if (remoteAddr && remoteAddr !== "unknown") {
    return remoteAddr
  }
  return "127.0.0.1"
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || ""

  try {
    const { email, password } = await request.json()

    console.log("Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing credentials",
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    try {
      // Connect to MongoDB and get user
      const { db } = await connectToDatabase()
      console.log("Connected to database successfully")

      const user = await db.collection("users").findOne({ email: email.toLowerCase() })
      console.log("User found:", user ? "Yes" : "No")

      if (!user) {
        console.log("User not found for email:", email)
        return NextResponse.json(
          {
            success: false,
            error: "Invalid credentials",
            message: "Invalid email or password",
          },
          { status: 401 },
        )
      }

      // Verify password
      console.log("Comparing password...")
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      console.log("Password valid:", isValidPassword)

      if (!isValidPassword) {
        console.log("Invalid password for user:", email)
        return NextResponse.json(
          {
            success: false,
            error: "Invalid credentials",
            message: "Invalid email or password",
          },
          { status: 401 },
        )
      }

      // Update last login timestamp
      try {
        await db.collection("users").updateOne({ _id: user._id }, { $set: { last_login: new Date() } })
        console.log("Updated last login timestamp")
      } catch (updateError) {
        console.error("Error updating last login:", updateError)
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "7d" },
      )

      console.log("Generated JWT token successfully")

      // Create response
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || "user",
          subscriptionStatus: user.subscription_status || "free",
          isEmailVerified: user.is_email_verified || false,
          createdAt: user.created_at,
          updatedAt: user.updated_at || user.created_at,
        },
      })

      // Set httpOnly cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      console.log("Login successful for user:", email)
      return response
    } catch (dbError) {
      console.error("Database connection error:", dbError)

      // Fallback to demo user if database is unavailable
      const demoUsers = [
        {
          id: "demo-user-123",
          email: "demo@coinwayfinder.com",
          password: "password",
          username: "demo_user",
          first_name: "Demo",
          last_name: "User",
          role: "user",
          subscription_status: "pro",
          is_email_verified: true,
          created_at: new Date(),
          last_login: new Date(),
        },
        {
          id: "admin-demo-456",
          email: "admin@coinwayfinder.com",
          password: "admin123",
          username: "admin_user",
          first_name: "Admin",
          last_name: "User",
          role: "admin",
          subscription_status: "enterprise",
          is_email_verified: true,
          created_at: new Date(),
          last_login: new Date(),
        },
        {
          id: "test-user-789",
          email: "test@example.com",
          password: "test123",
          username: "test_user",
          first_name: "Test",
          last_name: "User",
          role: "user",
          subscription_status: "free",
          is_email_verified: true,
          created_at: new Date(),
          last_login: new Date(),
        },
      ]

      // Check if credentials match any demo user
      const demoUser = demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase())

      if (demoUser && demoUser.password === password) {
        console.log("Using demo user login for:", email)

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: demoUser.id,
            email: demoUser.email,
          },
          process.env.JWT_SECRET || "fallback-secret-key",
          { expiresIn: "7d" },
        )

        // Create response
        const response = NextResponse.json({
          success: true,
          message: "Login successful (Demo Mode)",
          user: {
            id: demoUser.id,
            email: demoUser.email,
            username: demoUser.username,
            firstName: demoUser.first_name,
            lastName: demoUser.last_name,
            role: demoUser.role,
            subscriptionStatus: demoUser.subscription_status,
            isEmailVerified: demoUser.is_email_verified,
            createdAt: demoUser.created_at,
            updatedAt: demoUser.last_login,
          },
        })

        // Set httpOnly cookie
        response.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        })

        return response
      }

      // Invalid credentials
      console.log("Invalid credentials for:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Login error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during login. Please try again.",
      },
      { status: 500 },
    )
  }
}
