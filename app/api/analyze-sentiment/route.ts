import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Mock sentiment analysis - in production, integrate with actual AI service
    const sentiment = analyzeSentiment(text)

    return NextResponse.json({
      sentiment: sentiment.label,
      confidence: sentiment.score,
      analysis: {
        positive: sentiment.positive,
        negative: sentiment.negative,
        neutral: sentiment.neutral,
      },
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}

function analyzeSentiment(text: string) {
  // Simple keyword-based sentiment analysis
  const positiveWords = ["bullish", "moon", "pump", "gain", "profit", "buy", "long", "up", "rise", "green"]
  const negativeWords = ["bearish", "dump", "crash", "loss", "sell", "short", "down", "fall", "red", "dip"]

  const words = text.toLowerCase().split(/\s+/)
  let positiveCount = 0
  let negativeCount = 0

  words.forEach((word) => {
    if (positiveWords.some((pw) => word.includes(pw))) positiveCount++
    if (negativeWords.some((nw) => word.includes(nw))) negativeCount++
  })

  const total = positiveCount + negativeCount
  if (total === 0) {
    return { label: "neutral", score: 0.5, positive: 0.33, negative: 0.33, neutral: 0.34 }
  }

  const positiveRatio = positiveCount / total
  const negativeRatio = negativeCount / total

  if (positiveRatio > negativeRatio) {
    return {
      label: "positive",
      score: positiveRatio,
      positive: positiveRatio,
      negative: negativeRatio,
      neutral: 1 - positiveRatio - negativeRatio,
    }
  } else if (negativeRatio > positiveRatio) {
    return {
      label: "negative",
      score: negativeRatio,
      positive: positiveRatio,
      negative: negativeRatio,
      neutral: 1 - positiveRatio - negativeRatio,
    }
  } else {
    return { label: "neutral", score: 0.5, positive: 0.33, negative: 0.33, neutral: 0.34 }
  }
}
