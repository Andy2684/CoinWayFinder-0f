import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Simple sentiment analysis mock
    const positiveWords = ["bullish", "moon", "pump", "buy", "long", "up", "rise", "gain", "profit"]
    const negativeWords = ["bearish", "dump", "sell", "short", "down", "fall", "loss", "crash"]

    const words = text.toLowerCase().split(/\s+/)
    let score = 0

    words.forEach((word: string) => {
      if (positiveWords.includes(word)) score += 1
      if (negativeWords.includes(word)) score -= 1
    })

    let sentiment = "neutral"
    if (score > 0) sentiment = "positive"
    if (score < 0) sentiment = "negative"

    return NextResponse.json({
      sentiment,
      score,
      confidence: Math.min(Math.abs(score) * 0.2, 1),
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
