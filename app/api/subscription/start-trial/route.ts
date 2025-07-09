import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { db } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
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

    if (!trialStatus.isEligible) {
      return NextResponse.json(
        {
          error: "Trial not available",
          message: "You have already used your free trial or have an active trial",
        },
        { status: 400 },
      )
    }

    const result = await subscriptionManager.startFreeTrial(user.id)

    if (result.success) {
      // Update user settings to mark trial as started
      const trialStartDate = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialStartDate.getDate() + 3)

      await db.updateUser(user.id, {
        settings: {
          ...user.settings,
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
        },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Start trial error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to start trial",
      },
      { status: 500 },
    )
  }
}
