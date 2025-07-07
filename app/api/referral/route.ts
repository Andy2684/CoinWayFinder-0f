import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, referralCode } = body

    if (!userId || !referralCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await subscriptionManager.processReferral(userId, referralCode)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Referral processing failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
