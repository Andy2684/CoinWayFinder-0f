import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager } from "@/lib/subscription-manager"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Check if user exists
    const user = await database.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Start the free trial
    const result = await subscriptionManager.startFreeTrial(userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        trialEndDate: result.trialEndDate,
        plan: "trial",
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Failed to start trial:", error)
    return NextResponse.json({ error: "Failed to start trial" }, { status: 500 })
  }
}
