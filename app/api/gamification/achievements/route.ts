import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Achievement } from "@/types/achievement" // Declare the Achievement variable

const ONBOARDING_ACHIEVEMENTS = [
  {
    id: "welcome_aboard",
    title: "Welcome Aboard!",
    description: "Started your CoinWayFinder journey",
    icon: "🚀",
    category: "onboarding",
    points: 50,
    rarity: "common",
  },
  {
    id: "profile_master",
    title: "Profile Master",
    description: "Completed your profile setup",
    icon: "👤",
    category: "onboarding",
    points: 100,
    rarity: "common",
  },
  {
    id: "experience_guru",
    title: "Experience Guru",
    description: "Shared your trading experience",
    icon: "📈",
    category: "onboarding",
    points: 75,
    rarity: "common",
  },
  {
    id: "preference_pro",
    title: "Preference Pro",
    description: "Customized your preferences",
    icon: "⚙️",
    category: "onboarding",
    points: 75,
    rarity: "common",
  },
  {
    id: "connection_champion",
    title: "Connection Champion",
    description: "Selected exchanges for connection",
    icon: "🔗",
    category: "onboarding",
    points: 125,
    rarity: "rare",
  },
  {
    id: "onboarding_legend",
    title: "Onboarding Legend",
    description: "Completed the entire onboarding process",
    icon: "🏆",
    category: "onboarding",
    points: 250,
    rarity: "epic",
  },
  {
    id: "speed_runner",
    title: "Speed Runner",
    description: "Completed onboarding in under 10 minutes",
    icon: "⚡",
    category: "onboarding",
    points: 300,
    rarity: "legendary",
  },
]

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

    const db = await connectToDatabase()
    const userProgress = await db.collection("user_progress").findOne({ userId: decoded.userId })

    if (!userProgress) {
      // Create initial progress record
      const initialProgress = {
        userId: decoded.userId,
        totalPoints: 0,
        level: 1,
        currentLevelPoints: 0,
        nextLevelPoints: 100,
        achievements: ONBOARDING_ACHIEVEMENTS.map((achievement) => ({
          ...achievement,
          progress: { current: 0, required: 1 },
        })),
        badges: [],
        streaks: {
          onboardingDays: 0,
          tradingDays: 0,
          learningDays: 0,
        },
        milestones: {
          profileCompleted: false,
          firstTrade: false,
          firstBot: false,
          firstProfit: false,
          communityJoined: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection("user_progress").insertOne(initialProgress)
      return NextResponse.json(initialProgress)
    }

    return NextResponse.json(userProgress)
  } catch (error) {
    console.error("Get achievements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { achievementId, stepData } = await request.json()

    const db = await connectToDatabase()
    const userProgress = await db.collection("user_progress").findOne({ userId: decoded.userId })

    if (!userProgress) {
      return NextResponse.json({ error: "User progress not found" }, { status: 404 })
    }

    // Check if achievement should be unlocked
    const achievement = userProgress.achievements.find((a: Achievement) => a.id === achievementId)
    if (!achievement || achievement.unlockedAt) {
      return NextResponse.json({ error: "Achievement not found or already unlocked" }, { status: 400 })
    }

    // Unlock achievement
    const updatedAchievements = userProgress.achievements.map((a: Achievement) =>
      a.id === achievementId ? { ...a, unlockedAt: new Date(), progress: { current: 1, required: 1 } } : a,
    )

    // Calculate new level and points
    const newTotalPoints = userProgress.totalPoints + achievement.points
    const newLevel = Math.floor(newTotalPoints / 100) + 1
    const currentLevelPoints = newTotalPoints % 100
    const nextLevelPoints = 100

    // Create badge if it's a special achievement
    const newBadges = [...userProgress.badges]
    if (achievement.rarity === "epic" || achievement.rarity === "legendary") {
      newBadges.push({
        id: `badge_${achievementId}`,
        name: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        color: achievement.rarity === "legendary" ? "gold" : "purple",
        earnedAt: new Date(),
        category: achievement.category,
      })
    }

    const updatedProgress = {
      ...userProgress,
      totalPoints: newTotalPoints,
      level: newLevel,
      currentLevelPoints,
      nextLevelPoints,
      achievements: updatedAchievements,
      badges: newBadges,
      updatedAt: new Date(),
    }

    await db.collection("user_progress").findOneAndUpdate({ userId: decoded.userId }, { $set: updatedProgress })

    return NextResponse.json({
      achievement,
      reward: {
        id: achievementId,
        type: "achievement",
        title: achievement.title,
        description: `+${achievement.points} points earned!`,
        value: achievement.points,
        icon: achievement.icon,
        animation: achievement.rarity === "legendary" ? "confetti" : "bounce",
      },
      newLevel: newLevel > userProgress.level ? newLevel : null,
      updatedProgress,
    })
  } catch (error) {
    console.error("Unlock achievement error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
