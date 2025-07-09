import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager } from "@/lib/subscription-manager"
import { authManager } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const user = await authManager.getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Start free trial
    const result = await subscriptionManager.startFreeTrial(user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      trialEndDate: result.trialEndDate,
    })
  } catch (error) {
    console.error("Error starting trial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
