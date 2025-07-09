import { type NextRequest, NextResponse } from "next/server"
import { cryptoAPI } from "@/lib/crypto-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const news = await cryptoAPI.getCryptoNews(limit)

    return NextResponse.json({
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString(),
      source: "CryptoPanic API",
    })
  } catch (error) {
    console.error("Crypto news API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch crypto news",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
