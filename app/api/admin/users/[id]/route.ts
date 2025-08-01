import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"
import { getUser, updateUser, deleteUser } from "@/lib/user"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get user before deletion for notification
    const user = await getUser(id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Delete the user
    await deleteUser(id)

    // Send admin action notification
    await adminNotificationService.sendAdminActionNotification({
      type: "user_deleted",
      adminId: "admin123", // This should come from auth context
      adminEmail: "admin@coinwayfinder.com", // This should come from auth context
      targetUserId: id,
      targetUserEmail: user.email,
      details: "User account deleted by administrator",
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    // Get current user data
    const currentUser = await getUser(id)
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update the user
    const updatedUser = await updateUser(id, updates)

    // Check for role changes and send notification
    if (updates.role && updates.role !== currentUser.role) {
      await adminNotificationService.sendAdminActionNotification({
        type: "role_changed",
        adminId: "admin123", // This should come from auth context
        adminEmail: "admin@coinwayfinder.com", // This should come from auth context
        targetUserId: id,
        targetUserEmail: currentUser.email,
        details: `User role changed from ${currentUser.role} to ${updates.role}`,
        timestamp: new Date(),
      })
    }

    // Check for status changes (ban/unban)
    if (updates.status && updates.status !== currentUser.status) {
      const actionType = updates.status === "banned" ? "user_banned" : "user_banned"
      await adminNotificationService.sendAdminActionNotification({
        type: actionType,
        adminId: "admin123", // This should come from auth context
        adminEmail: "admin@coinwayfinder.com", // This should come from auth context
        targetUserId: id,
        targetUserEmail: currentUser.email,
        details: `User status changed from ${currentUser.status} to ${updates.status}${updates.banReason ? `. Reason: ${updates.banReason}` : ""}`,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
