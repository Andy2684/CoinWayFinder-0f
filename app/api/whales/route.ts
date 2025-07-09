import { type NextRequest, NextResponse } from "next/server"
import { newsAPI } from "@/lib/news-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const transactions = await newsAPI.getWhaleTransactions(limit)

    return NextResponse.json({
      success: true,
      transactions,
      total: transactions.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Whale API error:", error)
    return NextResponse.json({ error: "Failed to fetch whale transactions" }, { status: 500 })
  }
}
