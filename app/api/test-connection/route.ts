import { type NextRequest, NextResponse } from "next/server"
import { createExchangeClient } from "@/lib/exchange-api-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exchange, apiKey, secretKey } = body

    if (!exchange || !apiKey || !secretKey) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const client = createExchangeClient(exchange, {
      apiKey,
      secretKey,
      sandbox: process.env.NODE_ENV !== "production",
    })

    const isConnected = await client.testConnection()

    if (isConnected) {
      // Get account balance to verify permissions
      const balances = await client.getBalance()
      return NextResponse.json({
        success: true,
        message: "Connection successful",
        balances: balances.slice(0, 5), // Return first 5 balances
      })
    } else {
      return NextResponse.json({ success: false, error: "Connection failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json({ success: false, error: "Connection test failed" }, { status: 500 })
  }
}
