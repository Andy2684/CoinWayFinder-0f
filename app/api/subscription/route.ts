import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const subscription = await subscriptionManager.getUserSubscription(userId)
    const usageStats = await subscriptionManager.getUsageStats(userId)

    return NextResponse.json({
      success: true,
      subscription,
      usage: usageStats,
    })
  } catch (error: any) {
    console.error("Get subscription failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planId, paymentMethodId, paymentType = "card" } = body

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result

    if (paymentType === "crypto") {
      result = await subscriptionManager.createCryptoPayment(userId, planId)
    } else {
      if (!paymentMethodId) {
        return NextResponse.json({ error: "Payment method required" }, { status: 400 })
      }
      result = await subscriptionManager.createSubscription(userId, planId, paymentMethodId)
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Create subscription failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const result = await subscriptionManager.cancelSubscription(userId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Cancel subscription failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
