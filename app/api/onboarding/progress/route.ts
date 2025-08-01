import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

const TOTAL_STEPS = 6

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
    const onboarding = await db.collection("user_onboarding").findOne({ userId: decoded.userId })

    if (!onboarding) {
      return NextResponse.json({
        totalSteps: TOTAL_STEPS,
        completedSteps: 0,
        currentStep: 0,
        percentComplete: 0,
      })
    }

    const completedSteps = onboarding.completedSteps?.length || 0
    const percentComplete = Math.round((completedSteps / TOTAL_STEPS) * 100)

    return NextResponse.json({
      totalSteps: TOTAL_STEPS,
      completedSteps,
      currentStep: onboarding.currentStep || 0,
      percentComplete,
    })
  } catch (error) {
    console.error("Get onboarding progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
