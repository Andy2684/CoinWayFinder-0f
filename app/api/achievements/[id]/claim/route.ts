import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ACHIEVEMENTS } from "@/lib/achievement-definitions"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const achievementId = params.id
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Find the user achievement
    const userAchievement = await db
      .collection("user_achievements")
      .findOne({ userId, achievementId, isCompleted: true, isClaimed: false })

    if (!userAchievement) {
      return NextResponse.json({ success: false, error: "Achievement not found or already claimed" }, { status: 404 })
    }

    // Find the achievement definition
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!achievement) {
      return NextResponse.json({ success: false, error: "Achievement definition not found" }, { status: 404 })
    }

    // Mark as claimed
    await db.collection("user_achievements").updateOne(
      { userId, achievementId },
      {
        $set: {
          isClaimed: true,
          claimedAt: new Date(),
        },
      },
    )

    // Process rewards
    const processedRewards = []
    if (achievement.rewards) {
      for (const reward of achievement.rewards) {
        switch (reward.type) {
          case "points":
            // Add bonus points to user statistics
            await db.collection("user_statistics").updateOne(
              { userId },
              {
                $inc: { bonusPoints: Number(reward.value) },
                $set: { updatedAt: new Date() },
              },
              { upsert: true },
            )
            processedRewards.push({
              type: "points",
              value: reward.value,
              description: `${reward.value} bonus XP points added`,
            })
            break

          case "feature":
            // Unlock feature for user
            await db.collection("user_features").updateOne(
              { userId },
              {
                $addToSet: { unlockedFeatures: reward.value },
                $set: { updatedAt: new Date() },
              },
              { upsert: true },
            )
            processedRewards.push({
              type: "feature",
              value: reward.value,
              description: reward.description,
            })
            break

          case "discount":
            // Add discount to user account
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + (reward.duration || 30))

            await db.collection("user_discounts").insertOne({
              userId,
              discountType: "percentage",
              discountValue: Number(reward.value),
              description: reward.description,
              expiresAt,
              isUsed: false,
              createdAt: new Date(),
            })
            processedRewards.push({
              type: "discount",
              value: reward.value,
              description: `${reward.value}% discount (expires in ${reward.duration || 30} days)`,
            })
            break

          case "premium":
            // Add premium time to user account
            const premiumExpiresAt = new Date()
            premiumExpiresAt.setDate(premiumExpiresAt.getDate() + Number(reward.value))

            await db.collection("user_premium").updateOne(
              { userId },
              {
                $set: {
                  expiresAt: premiumExpiresAt,
                  updatedAt: new Date(),
                },
              },
              { upsert: true },
            )
            processedRewards.push({
              type: "premium",
              value: reward.value,
              description: `${reward.value} days of premium access`,
            })
            break

          case "badge":
            // Add special badge to user
            await db.collection("user_badges").updateOne(
              { userId },
              {
                $addToSet: { badges: reward.value },
                $set: { updatedAt: new Date() },
              },
              { upsert: true },
            )
            processedRewards.push({
              type: "badge",
              value: reward.value,
              description: reward.description,
            })
            break
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Rewards claimed successfully",
      rewards: processedRewards,
    })
  } catch (error) {
    console.error("Failed to claim achievement:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
