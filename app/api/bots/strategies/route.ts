import { type NextRequest, NextResponse } from "next/server"
import { botStrategies, calculateEstimatedReturns } from "@/lib/bot-strategies"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const riskLevel = searchParams.get("riskLevel")

    let filteredStrategies = botStrategies

    if (category) {
      filteredStrategies = filteredStrategies.filter((strategy) => strategy.category === category)
    }

    if (difficulty) {
      filteredStrategies = filteredStrategies.filter((strategy) => strategy.difficulty === difficulty)
    }

    if (riskLevel) {
      filteredStrategies = filteredStrategies.filter((strategy) => strategy.riskLevel === riskLevel)
    }

    return NextResponse.json({
      success: true,
      strategies: filteredStrategies,
    })
  } catch (error) {
    console.error("Get strategies error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { strategy, investment, timeframe } = await request.json()

    if (!strategy || !investment || !timeframe) {
      return NextResponse.json(
        { success: false, error: "Strategy, investment, and timeframe are required" },
        { status: 400 },
      )
    }

    const estimatedReturns = calculateEstimatedReturns(strategy, investment, timeframe)

    return NextResponse.json({
      success: true,
      estimatedReturns,
    })
  } catch (error) {
    console.error("Calculate returns error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
