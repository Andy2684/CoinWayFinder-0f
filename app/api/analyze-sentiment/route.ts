import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Simple sentiment analysis simulation
    const positiveWords = ["bullish", "moon", "pump", "gain", "profit", "buy", "long", "up", "rise", "surge"]
    const negativeWords = ["bearish", "dump", "crash", "loss", "sell", "short", "down", "fall", "drop", "decline"]

    const words = text.toLowerCase().split(/\s+/)
    let score = 0

    words.forEach((word) => {
      if (positiveWords.includes(word)) score += 1
      if (negativeWords.includes(word)) score -= 1
    })

    let sentiment = "neutral"
    if (score > 0) sentiment = "positive"
    if (score < 0) sentiment = "negative"

    const confidence = Math.min((Math.abs(score) / words.length) * 10, 1)

    return NextResponse.json({
      sentiment,
      score,
      confidence: Math.round(confidence * 100) / 100,
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
