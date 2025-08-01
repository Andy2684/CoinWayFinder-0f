import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection("users")

    const user = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }, // Exclude password from response
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection("users")

    // Check if user exists
    const existingUser = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user
    const updateData = {
      ...body,
      updated_at: new Date(),
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData._id

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made to user" }, { status: 400 })
    }

    // Send admin notification about user update
    await adminNotificationService.sendAdminNotification({
      subject: "User Profile Updated",
      message: `User ${existingUser.email} profile has been updated by admin.`,
      recipients: [process.env.ADMIN_EMAIL || "admin@coinwayfinder.com"],
      metadata: {
        userId: id,
        updatedFields: Object.keys(updateData),
        adminAction: true,
      },
    })

    // Fetch updated user
    const updatedUser = await collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection("users")

    // Check if user exists
    const existingUser = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Send security alert about user deletion
    await adminNotificationService.sendSecurityAlert({
      subject: "User Account Deleted",
      message: `User account ${existingUser.email} has been permanently deleted by admin.`,
      recipients: [process.env.ADMIN_EMAIL || "admin@coinwayfinder.com"],
      metadata: {
        userId: id,
        userEmail: existingUser.email,
        deletedAt: new Date(),
        adminAction: true,
      },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
