import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get full user data from MongoDB
    const { db } = await connectToDatabase()
    const userData = await db.collection("users").findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password_hash: 0 } }, // Exclude password hash
    )

    if (!userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData._id.toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role || "user",
        subscriptionStatus: userData.subscription_status || "free",
        isEmailVerified: userData.is_email_verified || false,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
