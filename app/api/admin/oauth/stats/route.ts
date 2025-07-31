import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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
    const user = await db.collection("users").findOne({ _id: decoded.userId })

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get OAuth provider statistics
    const providerStats = await db
      .collection("users")
      .aggregate([
        { $unwind: { path: "$oauthAccounts", preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: "$oauthAccounts.provider",
            count: { $sum: 1 },
            lastUsed: { $max: "$oauthAccounts.lastUsed" },
            firstLinked: { $min: "$oauthAccounts.linkedAt" },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // Get users with multiple OAuth accounts
    const multiAccountUsers = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            $expr: { $gt: [{ $size: { $ifNull: ["$oauthAccounts", []] } }, 1] },
          },
        },
        {
          $project: {
            email: 1,
            username: 1,
            accountCount: { $size: "$oauthAccounts" },
            providers: "$oauthAccounts.provider",
          },
        },
        { $sort: { accountCount: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Get recent OAuth activity
    const recentActivity = await db
      .collection("users")
      .aggregate([
        { $unwind: { path: "$oauthAccounts", preserveNullAndEmptyArrays: false } },
        {
          $project: {
            email: 1,
            username: 1,
            provider: "$oauthAccounts.provider",
            linkedAt: "$oauthAccounts.linkedAt",
            lastUsed: "$oauthAccounts.lastUsed",
          },
        },
        { $sort: { linkedAt: -1 } },
        { $limit: 20 },
      ])
      .toArray()

    // Get OAuth adoption over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const adoptionTrend = await db
      .collection("users")
      .aggregate([
        { $unwind: { path: "$oauthAccounts", preserveNullAndEmptyArrays: false } },
        {
          $match: {
            "oauthAccounts.linkedAt": { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$oauthAccounts.linkedAt" } },
              provider: "$oauthAccounts.provider",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ])
      .toArray()

    return NextResponse.json({
      providerStats: providerStats.map((stat) => ({
        provider: stat._id,
        count: stat.count,
        lastUsed: stat.lastUsed,
        firstLinked: stat.firstLinked,
      })),
      multiAccountUsers: multiAccountUsers.map((user) => ({
        ...user,
        id: user._id.toString(),
        _id: undefined,
      })),
      recentActivity: recentActivity.map((activity) => ({
        ...activity,
        id: activity._id.toString(),
        _id: undefined,
      })),
      adoptionTrend,
    })
  } catch (error) {
    console.error("OAuth stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
