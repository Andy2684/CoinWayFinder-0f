import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {
  ACHIEVEMENTS,
  calculateLevel,
  getPointsForNextLevel,
  getCurrentLevelProgress,
} from "@/lib/achievement-definitions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get user achievements
    const userAchievements = await db.collection("user_achievements").find({ userId, isCompleted: true }).toArray()

    // Calculate total points
    let totalPoints = 0
    for (const userAchievement of userAchievements) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === userAchievement.achievementId)
      if (achievement) {
        totalPoints += achievement.points
      }
    }

    // Get user statistics (this would come from your user stats system)
    const userStats = (await db.collection("user_statistics").findOne({ userId })) || {
      totalTrades: 0,
      totalProfit: 0,
      totalVolume: 0,
      winRate: 0,
      bestTrade: 0,
      articlesRead: 0,
      coursesCompleted: 0,
      timeSpentLearning: 0,
      referrals: 0,
      communityPosts: 0,
      helpfulVotes: 0,
      portfolioValue: 0,
      assetsOwned: 0,
      diversificationScore: 0,
      botsCreated: 0,
      botsDeployed: 0,
      botProfit: 0,
      loginStreak: 0,
      bestLoginStreak: 0,
      daysActive: 0,
      accountAge: 0,
      perfectMonths: 0,
      betaTester: false,
      earlyAdopter: false,
    }

    const level = calculateLevel(totalPoints)
    const nextLevelPoints = getPointsForNextLevel(totalPoints)
    const currentLevelProgress = getCurrentLevelProgress(totalPoints)

    const progress = {
      userId,
      statistics: userStats,
      level,
      totalPoints,
      nextLevelPoints,
      currentLevelProgress,
    }

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Error fetching achievement progress:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch achievement progress" }, { status: 500 })
  }
}
