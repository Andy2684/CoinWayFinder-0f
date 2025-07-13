import { type NextRequest, NextResponse } from "next/server"
import { getExchangeConfig, buildAuthHeaders } from "@/lib/exchange-config"

export async function POST(request: NextRequest) {
  try {
    const { exchangeId, credentials, testnet } = await request.json()

    if (!exchangeId || !credentials) {
      return NextResponse.json({ success: false, error: "Missing exchange ID or credentials" }, { status: 400 })
    }

    const config = getExchangeConfig(exchangeId)
    if (!config) {
      return NextResponse.json({ success: false, error: "Unsupported exchange" }, { status: 400 })
    }

    // Use testnet URL if specified and available
    const baseUrl = testnet && config.testnetUrl ? config.testnetUrl : config.baseUrl

    // Test connection based on exchange
    let testEndpoint = ""
    const method = "GET"

    switch (exchangeId) {
      case "binance":
        testEndpoint = "/api/v3/account"
        break
      case "coinbase":
        testEndpoint = "/accounts"
        break
      case "bybit":
        testEndpoint = "/v5/account/wallet-balance"
        break
      default:
        testEndpoint = "/account" // Generic endpoint
    }

    // Build authentication headers
    const headers = buildAuthHeaders(exchangeId, credentials, method, testEndpoint)

    // Make test request
    const response = await fetch(`${baseUrl}${testEndpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: "Connection successful",
        data: {
          exchange: config.name,
          testnet,
          timestamp: new Date().toISOString(),
          // Don't return sensitive account data
          accountInfo: {
            hasBalance: Array.isArray(data.balances) ? data.balances.length > 0 : true,
            permissions: data.permissions || ["spot"],
          },
        },
      })
    } else {
      const errorData = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          details: errorData,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json({ success: false, error: "Connection test failed" }, { status: 500 })
  }
}
