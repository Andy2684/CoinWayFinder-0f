import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { config } from "@/lib/ai.config";

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 500 },
      );
    }

    const analyzedArticles = await Promise.all(
      articles.map(async (article: any) => {
        try {
          const { text } = await generateText({
            model: config.provider("gpt-4o"),
            system: `You are a financial news analyst. Analyze the sentiment and market impact of news articles.

Respond with a JSON object containing:
- sentiment: "positive", "negative", or "neutral"
- impact: "high", "medium", or "low"
- aiSummary: A brief 1-2 sentence analysis of how this might affect crypto/stock markets.`,
            prompt: `Analyze this news article:

Title: ${article.title}
Summary: ${article.summary}
Category: ${article.category}`,
          });

          const analysis = JSON.parse(text);

          return {
            ...article,
            sentiment: analysis.sentiment || "neutral",
            impact: analysis.impact || "medium",
            aiSummary: analysis.aiSummary || "",
          };
        } catch (err) {
          console.error("AI parsing error:", err);
          return { ...article, error: "AI analysis failed" };
        }
      }),
    );

    return NextResponse.json({ articles: analyzedArticles });
  } catch (err) {
    console.error("General error in /api/analyze-sentiment:", err);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 },
    );
  }
}
