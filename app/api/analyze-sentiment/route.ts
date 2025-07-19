import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const result = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
    })

    return NextResponse.json({ text: result.text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
