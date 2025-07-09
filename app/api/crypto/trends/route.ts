import { NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET() {
  try {
    const trends = await cryptoAPI.getTopGainersLosers()

    return NextResponse.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Market trends API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch market trends" }, { status: 500 })
  }
}
