import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievement-definitions"

export async function GET(request: NextRequest) {
  try {
    // Return all available achievements
    return NextResponse.json(ACHIEVEMENT_DEFINITIONS)
  } catch (error) {
    console.error("Failed to fetch achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, achievementId, progress = 1 } = body

    if (!userId || !achievementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if achievement already exists
    const existingAchievement = await db.collection("user_achievements").findOne({
      userId,
      achievementId,
    })

    if (existingAchievement) {
      // Update progress for progressive achievements
      const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId)
      if (achievement?.type === "cumulative" || achievement?.type === "progressive") {
        const result = await db.collection("user_achievements").updateOne(
          { userId, achievementId },
          {
            $set: {
              progress: Math.max(existingAchievement.progress, progress),
              updatedAt: new Date(),
            },
          },
        )
        return NextResponse.json({ updated: true, progress })
      }

      return NextResponse.json({ message: "Achievement already exists" })
    }

    // Create new achievement
    const userAchievement = {
      userId,
      achievementId,
      progress,
      unlockedAt: new Date(),
      claimed: false,
      createdAt: new Date(),
    }

    await db.collection("user_achievements").insertOne(userAchievement)

    // Update user's total points and level
    await updateUserProgress(userId, achievementId)

    return NextResponse.json({ success: true, achievement: userAchievement })
  } catch (error) {
    console.error("Failed to create achievement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateUserProgress(userId: string, achievementId: string) {
  const db = await connectToDatabase()

  const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId)
  if (!achievement) return

  // Get current progress
  const currentProgress = await db.collection("user_progress").findOne({ userId })
  const totalPoints = (currentProgress?.totalPoints || 0) + achievement.points

  // Calculate level (every 1000 points = 1 level)
  const level = Math.floor(totalPoints / 1000) + 1
  const currentLevelPoints = (level - 1) * 1000
  const nextLevelPoints = level * 1000

  await db.collection("user_progress").updateOne(
    { userId },
    {
      $set: {
        totalPoints,
        level,
        currentLevelPoints,
        nextLevelPoints,
        updatedAt: new Date(),
      },
      $inc: {
        totalAchievements: 1,
      },
      $setOnInsert: {
        createdAt: new Date(),
        streak: { login: 0, trading: 0, learning: 0 },
        stats: {
          tradesCompleted: 0,
          botsCreated: 0,
          profitGenerated: 0,
          coursesCompleted: 0,
          articlesRead: 0,
          referralsMade: 0,
          daysActive: 0,
        },
      },
    },
    { upsert: true },
  )
}
