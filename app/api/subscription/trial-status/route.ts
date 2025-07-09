import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager } from "@/lib/subscription-manager"
import { authManager } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const user = await authManager.getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get trial status
    const trialStatus = await subscriptionManager.getTrialStatus(user.id)

    return NextResponse.json(trialStatus)
  } catch (error) {
    console.error("Error getting trial status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
