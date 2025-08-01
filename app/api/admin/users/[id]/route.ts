import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const db = await connectToDatabase()

    const user = await db.collection("users").findOne({ _id: id })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const { password, ...safeUser } = user

    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { email, role, status, firstName, lastName } = body

    const db = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ _id: id })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (email) updateData.email = email
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName

    await db.collection("users").updateOne({ _id: id }, { $set: updateData })

    // Send admin notification
    await adminNotificationService.sendAdminAction({
      action: "User Updated",
      adminUser: "Admin", // Get from auth context
      targetUser: existingUser.email,
      details: `User profile updated: ${Object.keys(updateData).join(", ")}`,
    })

    return NextResponse.json({ success: true, message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const db = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ _id: id })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await db.collection("users").deleteOne({ _id: id })

    // Send admin notification
    await adminNotificationService.sendAdminAction({
      action: "User Deleted",
      adminUser: "Admin", // Get from auth context
      targetUser: existingUser.email,
      details: `User account permanently deleted`,
    })

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
