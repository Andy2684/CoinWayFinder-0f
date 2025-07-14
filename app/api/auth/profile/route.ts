import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock user database - same as other auth routes
const users = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    firstName: "Demo",
    lastName: "User",
    username: "demouser",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    website: "https://demo.coinwayfinder.com",
    bio: "Passionate crypto trader and blockchain enthusiast. Always looking for the next big opportunity in DeFi and NFTs.",
    timezone: "America/New_York",
    role: "user",
    plan: "starter",
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    avatar: "/placeholder-user.jpg",
    preferences: {
      theme: "dark",
      notifications: true,
      twoFactor: false,
      emailAlerts: true,
      smsAlerts: false,
      tradingAlerts: true,
      newsAlerts: true,
    },
    securitySettings: {
      sessionTimeout: "30",
      ipWhitelist: false,
      apiAccess: false,
    },
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    website: "https://admin.coinwayfinder.com",
    bio: "System administrator and crypto expert. Managing the platform and helping users succeed in their trading journey.",
    timezone: "America/Los_Angeles",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    avatar: "/placeholder-user.jpg",
    preferences: {
      theme: "dark",
      notifications: true,
      twoFactor: true,
      emailAlerts: true,
      smsAlerts: true,
      tradingAlerts: true,
      newsAlerts: true,
    },
    securitySettings: {
      sessionTimeout: "60",
      ipWhitelist: true,
      apiAccess: true,
    },
  },
]

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const updateData = await request.json()

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Find user by ID
      const userIndex = users.findIndex((u) => u.id === decoded.userId)

      if (userIndex === -1) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      // Validate required fields
      if (updateData.firstName && updateData.firstName.trim().length < 1) {
        return NextResponse.json({ success: false, error: "First name is required" }, { status: 400 })
      }

      if (updateData.lastName && updateData.lastName.trim().length < 1) {
        return NextResponse.json({ success: false, error: "Last name is required" }, { status: 400 })
      }

      if (updateData.username && updateData.username.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: "Username must be at least 3 characters long" },
          { status: 400 },
        )
      }

      if (updateData.email && (!updateData.email.includes("@") || updateData.email.trim().length < 5)) {
        return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 })
      }

      // Check if username is already taken (excluding current user)
      if (updateData.username) {
        const existingUser = users.find((u) => u.username === updateData.username && u.id !== decoded.userId)
        if (existingUser) {
          return NextResponse.json({ success: false, error: "Username is already taken" }, { status: 400 })
        }
      }

      // Check if email is already taken (excluding current user)
      if (updateData.email) {
        const existingUser = users.find((u) => u.email === updateData.email && u.id !== decoded.userId)
        if (existingUser) {
          return NextResponse.json({ success: false, error: "Email is already registered" }, { status: 400 })
        }
      }

      // Update user data (deep merge for nested objects)
      const currentUser = users[userIndex]
      users[userIndex] = {
        ...currentUser,
        ...updateData,
        preferences: updateData.preferences
          ? { ...currentUser.preferences, ...updateData.preferences }
          : currentUser.preferences,
        securitySettings: updateData.securitySettings
          ? { ...currentUser.securitySettings, ...updateData.securitySettings }
          : currentUser.securitySettings,
      }

      // Return updated user (excluding sensitive data)
      const { ...userResponse } = users[userIndex]

      return NextResponse.json({
        success: true,
        user: userResponse,
        message: "Profile updated successfully",
      })
    } catch (jwtError) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Find user by ID
      const user = users.find((u) => u.id === decoded.userId)

      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      // Return user data (excluding sensitive data)
      const { ...userResponse } = user

      return NextResponse.json({
        success: true,
        user: userResponse,
      })
    } catch (jwtError) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
