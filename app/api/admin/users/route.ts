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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""
    const provider = searchParams.get("provider") || ""

    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = {}

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ]
    }

    if (role) {
      filter.role = role
    }

    if (status === "verified") {
      filter.isEmailVerified = true
    } else if (status === "unverified") {
      filter.isEmailVerified = false
    }

    if (provider) {
      filter["oauthAccounts.provider"] = provider
    }

    // Get users with pagination
    const users = await db
      .collection("users")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .project({ passwordHash: 0 })
      .toArray()

    // Get total count
    const total = await db.collection("users").countDocuments(filter)

    // Get statistics
    const stats = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            verifiedUsers: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
            oauthUsers: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$oauthAccounts", []] } }, 0] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    const userStats = stats[0] || {
      totalUsers: 0,
      verifiedUsers: 0,
      adminUsers: 0,
      oauthUsers: 0,
    }

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        id: user._id.toString(),
        _id: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: userStats,
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
