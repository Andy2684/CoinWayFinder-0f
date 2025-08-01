import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    const userAchievements = await db.collection("user_achievements").find({ userId }).toArray()

    return NextResponse.json({
      success: true,
      achievements: userAchievements.map((ua) => ({
        ...ua,
        unlockedAt: ua.unlockedAt,
        claimedAt: ua.claimedAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching user achievements:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user achievements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, achievementId, progress = 1, maxProgress = 1 } = body

    if (!userId || !achievementId) {
      return NextResponse.json({ success: false, error: "User ID and Achievement ID are required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if user achievement already exists
    const existingAchievement = await db.collection("user_achievements").findOne({ userId, achievementId })

    if (existingAchievement) {
      // Update progress
      const isCompleted = progress >= maxProgress
      const updateData: any = {
        progress,
        maxProgress,
        isCompleted,
        updatedAt: new Date(),
      }

      if (isCompleted && !existingAchievement.isCompleted) {
        updateData.unlockedAt = new Date()
      }

      await db.collection("user_achievements").updateOne({ userId, achievementId }, { $set: updateData })
    } else {
      // Create new user achievement
      const isCompleted = progress >= maxProgress
      const userAchievement = {
        userId,
        achievementId,
        progress,
        maxProgress,
        isCompleted,
        isClaimed: false,
        unlockedAt: isCompleted ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection("user_achievements").insertOne(userAchievement)
    }

    return NextResponse.json({
      success: true,
      message: "User achievement updated successfully",
    })
  } catch (error) {
    console.error("Error updating user achievement:", error)
    return NextResponse.json({ success: false, error: "Failed to update user achievement" }, { status: 500 })
  }
}
