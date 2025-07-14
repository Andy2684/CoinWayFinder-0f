import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Вызов AI происходит только внутри обработки запроса
    const { text: analysis } = await generateText({
      model: xai("grok-3"),
      prompt: `Analyze the sentiment of this cryptocurrency-related text and provide a score from -1 (very negative) to 1 (very positive), along with key insights:

Text: "${text}"

Respond in JSON format with:
- sentiment_score: number between -1 and 1
- sentiment_label: "positive", "negative", or "neutral"
- confidence: number between 0 and 1
- key_insights: array of strings with main points
- market_impact: brief description of potential market impact`,
    })

    const sentimentData = JSON.parse(analysis)

    return NextResponse.json({
      success: true,
      data: sentimentData,
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    )
  }
}
