import { NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET() {
  try {
    const news = await cryptoAPI.getCryptoNews()

    return NextResponse.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Crypto news API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch crypto news" }, { status: 500 })
  }
}
