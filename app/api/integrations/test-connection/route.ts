import { type NextRequest, NextResponse } from "next/server"
import { ExchangeAdapterFactory } from "@/lib/exchange-adapters"

export async function POST(request: NextRequest) {
  try {
    const { exchangeId, testnet = false } = await request.json()

    if (!exchangeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing exchange ID or ",
        },
        { status: 400 },
      )
    }

    // Validate required 
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key and secret key are required",
        },
        { status: 400 },
      )
    }

    // Get the exchange adapter
    const adapter = ExchangeAdapterFactory.getAdapter(exchangeId, testnet)
    if (!adapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported exchange",
        },
        { status: 400 },
      )
    }

    // Test authentication
    const isAuthenticated = await adapter.authenticate()

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed. Please check your API .",
        },
        { status: 401 },
      )
    }

    // Test basic functionality by fetching account balance
    try {
      const balance = await adapter.getBalance()
      const rateLimit = adapter.getRateLimit()

      return NextResponse.json({
        success: true,
        message: "Connection successful",
        data: {
          exchange: adapter.name,
          exchangeId: adapter.id,
          testnet,
          timestamp: new Date().toISOString(),
          accountInfo: {
            hasBalance: Array.isArray(balance.balances) ? balance.balances.length > 0 : true,
            balanceCount: Array.isArray(balance.balances) ? balance.balances.length : 0,
            accountType: balance.accountType || "spot",
            canTrade: balance.canTrade !== false,
            canWithdraw: balance.canWithdraw !== false,
            canDeposit: balance.canDeposit !== false,
          },
          rateLimit: {
            requests: rateLimit.requests,
            window: rateLimit.window,
            remaining: rateLimit.remaining,
          },
        },
      })
    } catch (balanceError) {
      // Authentication succeeded but balance fetch failed
      // This might be due to permissions or other issues
      console.error("Balance fetch error:", balanceError)

      return NextResponse.json({
        success: true,
        message: "Authentication successful, but limited access detected",
        warning: "Could not fetch account balance. Check API key permissions.",
        data: {
          exchange: adapter.name,
          exchangeId: adapter.id,
          testnet,
          timestamp: new Date().toISOString(),
          accountInfo: {
            hasBalance: false,
            balanceCount: 0,
            accountType: "unknown",
            canTrade: false,
            canWithdraw: false,
            canDeposit: false,
          },
          rateLimit: adapter.getRateLimit(),
        },
      })
    }
  } catch (error) {
    console.error("Connection test error:", error)

    // Provide more specific error messages
    let errorMessage = "Connection test failed"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes("Authentication failed") || error.message.includes("Invalid API")) {
        errorMessage = "Invalid API "
        statusCode = 401
      } else if (error.message.includes("Rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later."
        statusCode = 429
      } else if (error.message.includes("Network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection."
        statusCode = 503
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: statusCode },
    )
  }
}
