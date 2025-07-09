import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const trialStatus = await subscriptionManager.getTrialStatus(userId)

    return NextResponse.json({
      success: true,
      ...trialStatus,
    })
  } catch (error) {
    console.error("Failed to get trial status:", error)
    return NextResponse.json({ error: "Failed to get trial status" }, { status: 500 })
  }
}
