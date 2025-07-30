import { type NextRequest, NextResponse } from "next/server"
import { getUserDatabase } from "@/lib/real-time-user-db"
import jwt from "jsonwebtoken"

const userDb = getUserDatabase()

async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any
    const user = await userDb.getUserById(decoded.userId)

    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const url = new URL(request.url)
    const action = url.searchParams.get("action")

    switch (action) {
      case "profile":
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            subscription_status: user.subscription_status,
            is_email_verified: user.is_email_verified,
            profile_picture: user.profile_picture,
            phone: user.phone,
            location: user.location,
            website: user.website,
            bio: user.bio,
            preferences: user.preferences,
            activity: user.activity,
            trading_data: user.trading_data,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        })

      case "sessions":
        const sessions = await userDb.getUserSessions(user.id!)
        return NextResponse.json({
          success: true,
          sessions: sessions.map((session) => ({
            session_id: session.session_id,
            device_info: session.device_info,
            expires_at: session.expires_at,
            is_active: session.is_active,
            created_at: session.created_at,
          })),
        })

      case "stats":
        if (user.role !== "admin") {
          return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
        }

        const stats = await userDb.getUserStats()
        return NextResponse.json({
          success: true,
          stats,
        })

      case "active":
        if (user.role !== "admin") {
          return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
        }

        const limit = Number.parseInt(url.searchParams.get("limit") || "50")
        const activeUsers = await userDb.getActiveUsers(limit)
        return NextResponse.json({
          success: true,
          users: activeUsers.map((u) => ({
            id: u.id,
            email: u.email,
            username: u.username,
            first_name: u.first_name,
            last_name: u.last_name,
            role: u.role,
            subscription_status: u.subscription_status,
            last_active: u.activity.last_active,
          })),
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "update-profile":
        const allowedFields = ["first_name", "last_name", "phone", "location", "website", "bio", "profile_picture"]

        const updateData: any = {}
        for (const field of allowedFields) {
          if (data[field] !== undefined) {
            updateData[field] = data[field]
          }
        }

        const updatedUser = await userDb.updateUser(user.id!, updateData)

        if (updatedUser) {
          return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              username: updatedUser.username,
              first_name: updatedUser.first_name,
              last_name: updatedUser.last_name,
              phone: updatedUser.phone,
              location: updatedUser.location,
              website: updatedUser.website,
              bio: updatedUser.bio,
              profile_picture: updatedUser.profile_picture,
              updated_at: updatedUser.updated_at,
            },
          })
        } else {
          return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
        }

      case "update-preferences":
        const updatedPrefsUser = await userDb.updateUserPreferences(user.id!, data.preferences)

        if (updatedPrefsUser) {
          return NextResponse.json({
            success: true,
            message: "Preferences updated successfully",
            preferences: updatedPrefsUser.preferences,
          })
        } else {
          return NextResponse.json({ success: false, error: "Failed to update preferences" }, { status: 500 })
        }

      case "invalidate-session":
        const success = await userDb.invalidateSession(data.sessionId)
        return NextResponse.json({
          success,
          message: success ? "Session invalidated successfully" : "Failed to invalidate session",
        })

      case "invalidate-all-sessions":
        const count = await userDb.invalidateAllUserSessions(user.id!)
        return NextResponse.json({
          success: true,
          message: `${count} sessions invalidated successfully`,
          invalidatedCount: count,
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Users PUT API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")

    if (sessionId) {
      const success = await userDb.invalidateSession(sessionId)
      return NextResponse.json({
        success,
        message: success ? "Session deleted successfully" : "Failed to delete session",
      })
    }

    return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 })
  } catch (error) {
    console.error("Users DELETE API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
