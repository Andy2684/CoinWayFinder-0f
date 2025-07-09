import { NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET() {
  try {
    const whaleAlerts = await cryptoAPI.getWhaleAlerts()

    return NextResponse.json({
      success: true,
      data: whaleAlerts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Whale alerts API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch whale alerts" }, { status: 500 })
  }
}
