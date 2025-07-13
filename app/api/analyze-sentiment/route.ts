import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const { text: analysis } = await generateText({
      model: xai("grok-3"),
      prompt: `Analyze the sentiment of this cryptocurrency-related text and provide a score from -1 (very negative) to 1 (very positive), along with key insights:

Text: "${text}"

Please respond in JSON format with:
- sentiment_score: number between -1 and 1
- sentiment_label: "positive", "negative", or "neutral"
- confidence: number between 0 and 1
- key_points: array of strings with main insights
- market_impact: brief description of potential market impact`,
    })

    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysis)
    } catch {
      // Fallback if AI doesn't return valid JSON
      parsedAnalysis = {
        sentiment_score: 0,
        sentiment_label: "neutral",
        confidence: 0.5,
        key_points: ["Analysis could not be parsed"],
        market_impact: "Unknown impact",
      }
    }

    return NextResponse.json(parsedAnalysis)
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
