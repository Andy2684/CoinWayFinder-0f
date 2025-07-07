import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const settings = await database.getUserSettings(userId)
    if (!settings) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      referralCode: settings.referrals.referralCode,
      referredUsers: settings.referrals.referredUsers.length,
      bonusDays: settings.referrals.bonusDays,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${settings.referrals.referralCode}`,
    })
  } catch (error) {
    console.error("Failed to get referral info:", error)
    return NextResponse.json({ error: "Failed to get referral information" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, referralCode } = body

    if (!userId || !referralCode) {
      return NextResponse.json({ error: "User ID and referral code required" }, { status: 400 })
    }

    const result = await subscriptionManager.processReferral(userId, referralCode)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to process referral:", error)
    return NextResponse.json({ error: "Failed to process referral" }, { status: 500 })
  }
}
