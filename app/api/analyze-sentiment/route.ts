import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const { text: sentiment } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze the sentiment of this crypto-related text and provide a score from -1 (very negative) to 1 (very positive), along with a brief explanation: "${text}"`,
      system:
        'You are a cryptocurrency market sentiment analyzer. Respond with a JSON object containing "score" (number between -1 and 1) and "explanation" (string).',
    })

    let analysis
    try {
      analysis = JSON.parse(sentiment)
    } catch {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        score: 0,
        explanation: "Unable to parse sentiment analysis",
      }
    }

    return NextResponse.json({
      sentiment: analysis.score,
      explanation: analysis.explanation,
      originalText: text,
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
