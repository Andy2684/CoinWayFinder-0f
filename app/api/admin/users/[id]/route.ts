import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const adminUser = await db.collection("users").findOne({ _id: decoded.userId })

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) }, { projection: { passwordHash: 0 } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      id: user._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Admin user fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const adminUser = await db.collection("users").findOne({ _id: decoded.userId })

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...updates } = body

    // Get target user before update
    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(params.id) })
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let updateQuery: any = {}
    let actionDescription = ""

    switch (action) {
      case "update":
        updateQuery = {
          $set: {
            ...updates,
            updated_at: new Date(),
          },
        }
        actionDescription = `Updated user profile: ${Object.keys(updates).join(", ")}`
        break
      case "verify":
        updateQuery = {
          $set: {
            isEmailVerified: true,
            updated_at: new Date(),
          },
        }
        actionDescription = "Verified user email address"
        break
      case "unverify":
        updateQuery = {
          $set: {
            isEmailVerified: false,
            updated_at: new Date(),
          },
        }
        actionDescription = "Unverified user email address"
        break
      case "promote":
        updateQuery = {
          $set: {
            role: "admin",
            updated_at: new Date(),
          },
        }
        actionDescription = "Promoted user to admin role"
        break
      case "demote":
        updateQuery = {
          $set: {
            role: "user",
            updated_at: new Date(),
          },
        }
        actionDescription = "Demoted user from admin role"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const result = await db.collection("users").findOneAndUpdate({ _id: new ObjectId(params.id) }, updateQuery, {
      returnDocument: "after",
      projection: { passwordHash: 0 },
    })

    if (!result.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send admin action notification
    try {
      const { adminNotificationHelper } = await import("@/lib/admin-notification-helper")
      await adminNotificationHelper.sendAdminActionNotification(
        adminUser.email,
        adminUser.username || adminUser.email,
        targetUser.email,
        targetUser.username || targetUser.email,
        action,
        actionDescription,
        {
          targetUserId: params.id,
          adminUserId: decoded.userId,
          changes: updates,
        },
      )
    } catch (notificationError) {
      console.error("Failed to send admin action notification:", notificationError)
      // Don't fail the main operation if notification fails
    }

    return NextResponse.json({
      ...result.value,
      id: result.value._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const adminUser = await db.collection("users").findOne({ _id: decoded.userId })

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Prevent self-deletion
    if (decoded.userId === params.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Get target user before deletion
    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(params.id) })
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send admin action notification
    try {
      const { adminNotificationHelper } = await import("@/lib/admin-notification-helper")
      await adminNotificationHelper.sendAdminActionNotification(
        adminUser.email,
        adminUser.username || adminUser.email,
        targetUser.email,
        targetUser.username || targetUser.email,
        "delete",
        "Permanently deleted user account",
        {
          targetUserId: params.id,
          adminUserId: decoded.userId,
          deletedUserData: {
            email: targetUser.email,
            username: targetUser.username,
            role: targetUser.role,
            createdAt: targetUser.created_at,
          },
        },
      )
    } catch (notificationError) {
      console.error("Failed to send admin action notification:", notificationError)
      // Don't fail the main operation if notification fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
