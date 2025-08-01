import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const achievementId = params.id
    // In a real app, get userId from authentication
    const userId = "demo-user"

    const db = await connectToDatabase()

    const result = await db.collection("user_achievements").updateOne(
      { userId, achievementId, claimed: false },
      {
        $set: {
          claimed: true,
          claimedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Achievement not found or already claimed" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to claim achievement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
