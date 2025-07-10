import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, context = "general" } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const { text: analysis } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze the sentiment of the following text in the context of ${context}:

"${text}"

Provide a detailed sentiment analysis including:
1. Overall sentiment (positive/negative/neutral)
2. Confidence score (0-100)
3. Key emotional indicators
4. Tone analysis
5. Context-specific insights

Return the analysis as JSON:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 85,
  "score": 0.75,
  "emotions": ["emotion1", "emotion2"],
  "tone": "professional|casual|aggressive|optimistic|pessimistic",
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary of the sentiment analysis"
}`,
      system: `You are an expert sentiment analysis AI. Analyze text sentiment accurately and provide detailed insights. Consider the context: ${context}`,
    })

    let sentimentResult
    try {
      sentimentResult = JSON.parse(analysis)
    } catch (parseError) {
      // Fallback analysis
      const words = text.toLowerCase().split(/\s+/)
      const positiveWords = ["good", "great", "excellent", "amazing", "positive", "bullish", "up", "gain", "profit"]
      const negativeWords = ["bad", "terrible", "awful", "negative", "bearish", "down", "loss", "crash"]

      const positiveCount = words.filter((word) => positiveWords.includes(word)).length
      const negativeCount = words.filter((word) => negativeWords.includes(word)).length

      let sentiment = "neutral"
      let score = 0.5

      if (positiveCount > negativeCount) {
        sentiment = "positive"
        score = 0.6 + (positiveCount / words.length) * 0.4
      } else if (negativeCount > positiveCount) {
        sentiment = "negative"
        score = 0.4 - (negativeCount / words.length) * 0.4
      }

      sentimentResult = {
        sentiment,
        confidence: Math.min(90, (Math.abs(positiveCount - negativeCount) / words.length) * 100 + 50),
        score,
        emotions: sentiment === "positive" ? ["optimistic"] : sentiment === "negative" ? ["pessimistic"] : ["neutral"],
        tone: "neutral",
        keywords: [
          ...new Set([
            ...words.filter((w) => positiveWords.includes(w)),
            ...words.filter((w) => negativeWords.includes(w)),
          ]),
        ],
        summary: `Text appears to be ${sentiment} with ${positiveCount} positive and ${negativeCount} negative indicators.`,
      }
    }

    return NextResponse.json({
      ...sentimentResult,
      originalText: text,
      context,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json(
      {
        sentiment: "neutral",
        confidence: 0,
        score: 0.5,
        emotions: [],
        tone: "unknown",
        keywords: [],
        summary: "Analysis failed",
        error: "Unable to analyze sentiment",
      },
      { status: 500 },
    )
  }
}
