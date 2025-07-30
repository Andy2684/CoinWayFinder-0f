import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken } from "@/lib/auth"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip !== "unknown" ? ip : "127.0.0.1"
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
  try {
    const body = await request.json()
    const { email, password } = body
    const clientIP = getClientIP(request)

    console.log("Login attempt for email:", email, "from IP:", clientIP)

    // Validate input
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

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input format",
          message: "Email and password must be strings",
        },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
          message: "Please enter a valid email address",
        },
        { status: 400 },
      )
    }

    try {
      // Try MongoDB first
      const { db } = await connectToDatabase()
      console.log("Connected to database successfully")

      const user = await db.collection("users").findOne({ email: normalizedEmail })
      console.log("User found in database:", user ? "Yes" : "No")

      if (user) {
        // Check if account is locked
        if (user.security?.locked_until && new Date() < new Date(user.security.locked_until)) {
          return NextResponse.json(
            {
              success: false,
              error: "Account locked",
              message: "Account is temporarily locked due to multiple failed login attempts",
            },
            { status: 423 },
          )
        }

        // Verify password
        console.log("Comparing password...")
        const isValidPassword = await bcrypt.compare(password, user.password_hash)
        console.log("Password valid:", isValidPassword)

        if (isValidPassword) {
          try {
            // Reset login attempts and update last login
            await db.collection("users").updateOne(
              { _id: user._id },
              {
                $set: {
                  last_login: new Date(),
                  updated_at: new Date(),
                },
                $unset: {
                  "security.login_attempts": "",
                  "security.locked_until": "",
                },
              },
            )
            console.log("Updated last login timestamp and reset login attempts")
          } catch (updateError) {
            console.error("Error updating user login info:", updateError)
            // Don't fail login if update fails
          }

          // Generate JWT token
          const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
          })

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
              lastLogin: user.last_login?.toISOString(),
              createdAt: user.created_at?.toISOString() || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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

          console.log("Login successful for user:", normalizedEmail)
          return response
        } else {
          // Increment login attempts
          try {
            const loginAttempts = (user.security?.login_attempts || 0) + 1
            const updateData: any = {
              "security.login_attempts": loginAttempts,
              updated_at: new Date(),
            }

            // Lock account after 5 failed attempts
            if (loginAttempts >= 5) {
              updateData["security.locked_until"] = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }

            await db.collection("users").updateOne({ _id: user._id }, { $set: updateData })
          } catch (updateError) {
            console.error("Error updating login attempts:", updateError)
          }

          console.log("Invalid password for user:", normalizedEmail)
        }
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError)

      // Fallback to demo users for development
      const predefinedDemoUsers = [
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

      // Check predefined demo users
      const predefinedUser = predefinedDemoUsers.find((user) => user.email === normalizedEmail)
      if (predefinedUser && predefinedUser.password === password) {
        console.log("Using predefined demo user login for:", normalizedEmail)

        const token = generateToken({
          userId: predefinedUser.id,
          email: predefinedUser.email,
        })

        const response = NextResponse.json({
          success: true,
          message: "Login successful (Demo Mode)",
          user: {
            id: predefinedUser.id,
            email: predefinedUser.email,
            username: predefinedUser.username,
            firstName: predefinedUser.first_name,
            lastName: predefinedUser.last_name,
            role: predefinedUser.role,
            subscriptionStatus: predefinedUser.subscription_status,
            isEmailVerified: predefinedUser.is_email_verified,
            lastLogin: predefinedUser.last_login.toISOString(),
            createdAt: predefinedUser.created_at.toISOString(),
            updatedAt: predefinedUser.last_login.toISOString(),
          },
        })

        response.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        })

        return response
      }

      // Check dynamically created demo users
      if (global.demoUsers) {
        const demoUser = global.demoUsers.find((user: any) => user.email === normalizedEmail)
        if (demoUser) {
          console.log("Found demo user, comparing password...")
          const isValidPassword = await bcrypt.compare(password, demoUser.password_hash)
          console.log("Demo user password valid:", isValidPassword)

          if (isValidPassword) {
            console.log("Using dynamically created demo user login for:", normalizedEmail)

            const token = generateToken({
              userId: demoUser.id,
              email: demoUser.email,
            })

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
                lastLogin: new Date().toISOString(),
                createdAt: demoUser.created_at.toISOString(),
                updatedAt: demoUser.created_at.toISOString(),
              },
            })

            response.cookies.set("auth-token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
              path: "/",
            })

            return response
          }
        }
      }
    }

    // Invalid credentials
    console.log("Invalid credentials for:", normalizedEmail)
    return NextResponse.json(
      {
        success: false,
        error: "Invalid credentials",
        message: "Invalid email or password. Please check your credentials and try again.",
      },
      { status: 401 },
    )
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
