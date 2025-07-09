import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { db } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await db.getUserById(decoded.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const subscriptionManager = SubscriptionManager.getInstance()
    const trialStatus = subscriptionManager.getTrialStatus(user.settings)

    return NextResponse.json({
      trialStatus,
      currentPlan: subscriptionManager.getUserEffectivePlan(user),
      limits: subscriptionManager.getSubscriptionLimits(subscriptionManager.getUserEffectivePlan(user)),
    })
  } catch (error) {
    console.error("Trial status error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
