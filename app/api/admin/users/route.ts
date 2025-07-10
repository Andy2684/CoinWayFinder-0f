import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { verifyAdminToken } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const userStats = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [{ $gte: ["$lastLoginAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0],
              },
            },
            premiumUsers: {
              $sum: {
                $cond: [{ $eq: ["$subscriptionStatus", "active"] }, 1, 0],
              },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      users,
      stats: userStats[0] || { totalUsers: 0, activeUsers: 0, premiumUsers: 0 },
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, userId, data } = await request.json()
    const { db } = await connectToDatabase()

    switch (action) {
      case "suspend":
        await db.collection("users").updateOne(
          { _id: userId },
          {
            $set: {
              status: "suspended",
              suspendedAt: new Date(),
              suspendedBy: adminUser.id,
            },
          },
        )
        break

      case "activate":
        await db.collection("users").updateOne(
          { _id: userId },
          {
            $set: {
              status: "active",
            },
            $unset: {
              suspendedAt: "",
              suspendedBy: "",
            },
          },
        )
        break

      case "updateSubscription":
        await db.collection("users").updateOne(
          { _id: userId },
          {
            $set: {
              subscriptionStatus: data.status,
              subscriptionPlan: data.plan,
              subscriptionUpdatedAt: new Date(),
            },
          },
        )
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin user action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
