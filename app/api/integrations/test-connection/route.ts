import { type NextRequest, NextResponse } from "next/server"
import { ExchangeAdapterFactory } from "@/lib/exchange-adapters"

export async function POST(request: NextRequest) {
  try {
    const { exchangeId, credentials, testnet = false } = await request.json()

    if (!exchangeId || !credentials) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing exchange ID or credentials",
        },
        { status: 400 },
      )
    }

    // Validate required credentials based on exchange
    const requiredFields = ["apiKey", "secretKey"]
    if (exchangeId === "coinbase" || exchangeId === "okx") {
      requiredFields.push("passphrase")
    }

    for (const field of requiredFields) {
      if (!credentials[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Get the exchange adapter
    const adapter = ExchangeAdapterFactory.getAdapter(exchangeId, testnet)
    if (!adapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported exchange",
          supportedExchanges: ExchangeAdapterFactory.getAllAdapters(),
        },
        { status: 400 },
      )
    }

    console.log(`Testing connection to ${adapter.name}${testnet ? " (testnet)" : ""}...`)

    // Test authentication
    const isAuthenticated = await adapter.authenticate(credentials)

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed. Please check your API credentials.",
          details: "Invalid API key, secret, or passphrase",
        },
        { status: 401 },
      )
    }

    console.log(`Authentication successful for ${adapter.name}`)

    // Test basic functionality by fetching account balance
    try {
      const balance = await adapter.getBalance()
      const rateLimit = adapter.getRateLimit()

      console.log(`Balance fetch successful for ${adapter.name}`)

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
            totalEquity: balance.totalEquity || null,
            totalWalletBalance: balance.totalWalletBalance || null,
          },
          rateLimit: {
            requests: rateLimit.requests,
            window: rateLimit.window,
            remaining: rateLimit.remaining,
          },
          features: {
            spotTrading: true,
            futuresTrading: exchangeId !== "coinbase",
            marginTrading: exchangeId !== "coinbase",
            orderTypes: ["market", "limit"],
            websocketSupport: true,
          },
        },
      })
    } catch (balanceError) {
      // Authentication succeeded but balance fetch failed
      console.error(`Balance fetch error for ${adapter.name}:`, balanceError)

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
          error: balanceError instanceof Error ? balanceError.message : "Unknown error",
        },
      })
    }
  } catch (error) {
    console.error("Connection test error:", error)

    // Provide more specific error messages
    let errorMessage = "Connection test failed"
    let statusCode = 500
    let errorDetails = null

    if (error instanceof Error) {
      if (error.message.includes("Authentication failed") || error.message.includes("Invalid API")) {
        errorMessage = "Invalid API credentials"
        statusCode = 401
      } else if (error.message.includes("Rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later."
        statusCode = 429
      } else if (error.message.includes("Network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection."
        statusCode = 503
      } else if (error.message.includes("CORS")) {
        errorMessage = "CORS error. This exchange may not support browser-based connections."
        statusCode = 400
      } else {
        errorMessage = error.message
        errorDetails = error.stack
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}

// GET endpoint to list supported exchanges
export async function GET() {
  try {
    const supportedExchanges = ExchangeAdapterFactory.getAllAdapters()

    const exchangeDetails = supportedExchanges.map((id) => {
      const adapter = ExchangeAdapterFactory.getAdapter(id)
      return {
        id,
        name: adapter?.name || id,
        testnetSupported: [
          "binance",
          "bybit",
          "coinbase",
          "okx",
          "kucoin",
          "gate-io",
          "crypto-com",
          "deribit",
          "bitget",
        ].includes(id),
        requiredCredentials:
          id === "coinbase" || id === "okx" ? ["apiKey", "secretKey", "passphrase"] : ["apiKey", "secretKey"],
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        supportedExchanges: exchangeDetails,
        totalCount: supportedExchanges.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching supported exchanges:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch supported exchanges",
      },
      { status: 500 },
    )
  }
}
