import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { verifyToken } from "@/lib/auth"
import { cache } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol") || "BTC"

    // Check cache first
    const cacheKey = `market-sentiment:${symbol}`
    const cachedSentiment = await cache.get(cacheKey)
    if (cachedSentiment) {
      return NextResponse.json(cachedSentiment)
    }

    // Generate AI market sentiment analysis
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze the current market sentiment for ${symbol} cryptocurrency. Consider recent price action, volume, news sentiment, and technical indicators. Provide a comprehensive analysis including:

1. Overall sentiment (bullish/bearish/neutral)
2. Confidence level (0-100)
3. Key factors influencing sentiment
4. Short-term outlook (1-7 days)
5. Risk factors to watch

Format the response as JSON with the following structure:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 85,
  "score": 72,
  "factors": ["factor1", "factor2", "factor3"],
  "outlook": "short-term outlook description",
  "risks": ["risk1", "risk2"],
  "recommendation": "trading recommendation",
  "timestamp": "${new Date().toISOString()}"
}`,
      system:
        "You are a professional cryptocurrency market analyst with expertise in sentiment analysis and technical analysis. Provide accurate, data-driven insights.",
    })

    let sentimentData
    try {
      sentimentData = JSON.parse(text)
    } catch (parseError) {
      // Fallback if AI response is not valid JSON
      sentimentData = {
        sentiment: "neutral",
        confidence: 50,
        score: 50,
        factors: ["AI analysis unavailable"],
        outlook: "Unable to determine market outlook",
        risks: ["Analysis error"],
        recommendation: "Exercise caution",
        timestamp: new Date().toISOString(),
      }
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, sentimentData, 600)

    return NextResponse.json(sentimentData)
  } catch (error) {
    console.error("Market sentiment analysis error:", error)
    return NextResponse.json(
      {
        sentiment: "neutral",
        confidence: 0,
        score: 50,
        factors: ["Analysis unavailable"],
        outlook: "Unable to analyze market conditions",
        risks: ["System error"],
        recommendation: "Manual analysis recommended",
        timestamp: new Date().toISOString(),
        error: "Analysis failed",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { symbols, timeframe = "1d" } = await request.json()

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "Invalid symbols array" }, { status: 400 })
    }

    const sentimentPromises = symbols.map(async (symbol: string) => {
      const cacheKey = `market-sentiment:${symbol}:${timeframe}`
      const cached = await cache.get(cacheKey)

      if (cached) {
        return { symbol, ...cached }
      }

      try {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt: `Provide a brief market sentiment analysis for ${symbol} over the ${timeframe} timeframe. Return only a JSON object with sentiment, confidence, and score.`,
          system: "You are a crypto market analyst. Respond only with valid JSON.",
        })

        const analysis = JSON.parse(text)
        await cache.set(cacheKey, analysis, 300) // 5 minutes cache

        return { symbol, ...analysis }
      } catch (error) {
        return {
          symbol,
          sentiment: "neutral",
          confidence: 0,
          score: 50,
          error: "Analysis failed",
        }
      }
    })

    const results = await Promise.all(sentimentPromises)

    return NextResponse.json({
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Bulk sentiment analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
