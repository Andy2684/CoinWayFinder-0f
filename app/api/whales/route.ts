import { type NextRequest, NextResponse } from "next/server"
import { whaleTracker } from "@/lib/news-api"
import { adminManager } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type") || "transactions" // transactions | wallets
    const minValue = Number.parseInt(searchParams.get("minValue") || "500000")

    // Check authentication
    const adminToken = request.cookies.get("admin-token")?.value
    const adminSession = adminToken ? adminManager.verifyAdminToken(adminToken) : null

    // For non-admin users, check subscription access (simplified for demo)
    if (!adminSession?.isAdmin) {
      // In production, you would check user subscription here
      const hasAccess = true // await subscriptionManager.hasFeatureAccess(userId, 'whaleTracking', adminSession)

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "Whale tracking requires premium subscription",
            upgrade: true,
          },
          { status: 403 },
        )
      }
    }

    if (type === "wallets") {
      const smartWallets = await whaleTracker.getSmartMoneyWallets(limit)

      return NextResponse.json({
        success: true,
        wallets: smartWallets,
        total: smartWallets.length,
        type: "smart_wallets",
        timestamp: new Date().toISOString(),
        isAdmin: !!adminSession?.isAdmin,
      })
    } else {
      const transactions = await whaleTracker.getRecentWhaleTransactions(limit)
      const filteredTransactions = transactions.filter((tx) => tx.amountUSD >= minValue)

      return NextResponse.json({
        success: true,
        transactions: filteredTransactions,
        total: filteredTransactions.length,
        type: "whale_transactions",
        filters: {
          minValue,
          limit,
        },
        timestamp: new Date().toISOString(),
        isAdmin: !!adminSession?.isAdmin,
      })
    }
  } catch (error) {
    console.error("Error fetching whale data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch whale data",
      },
      { status: 500 },
    )
  }
}
