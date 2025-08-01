import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // In a real app, get userId from authentication
    const userId = request.nextUrl.searchParams.get("userId") || "demo-user"

    const db = await connectToDatabase()

    let progress = await db.collection("user_progress").findOne({ userId })

    if (!progress) {
      // Create initial progress
      progress = {
        userId,
        totalPoints: 0,
        totalAchievements: 0,
        level: 1,
        currentLevelPoints: 0,
        nextLevelPoints: 1000,
        streak: { login: 0, trading: 0, learning: 0 },
        stats: {
          tradesCompleted: 0,
          botsCreated: 0,
          profitGenerated: 0,
          coursesCompleted: 0,
          articlesRead: 0,
          referralsMade: 0,
          daysActive: 1,
        },
        createdAt: new Date(),
      }

      await db.collection("user_progress").insertOne(progress)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Failed to fetch user progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = "demo-user", updates } = body

    const db = await connectToDatabase()

    await db.collection("user_progress").updateOne(
      { userId },
      {
        $set: { ...updates, updatedAt: new Date() },
      },
      { upsert: true },
    )

    const updatedProgress = await db.collection("user_progress").findOne({ userId })
    return NextResponse.json(updatedProgress)
  } catch (error) {
    console.error("Failed to update user progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
