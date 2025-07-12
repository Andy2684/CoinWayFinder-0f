import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ articles });
    }

    const analyzedArticles = await Promise.all(
      articles.map(async (article: any) => {
        try {
          const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            system: `You are a financial news analyst. Analyze the sentiment and market impact of news articles.
            
            Respond with a JSON object containing:
            - sentiment: "positive", "negative", or "neutral"
            - impact: "high", "medium", or "low"
            - aiSummary: A brief 1-2 sentence analysis of how this might affect crypto/stock markets
            
            Focus on market implications and trading relevance.`,
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
            aiSummary: analysis.aiSummary || null,
          };
        } catch (error) {
          console.error("Error analyzing article:", error);
          return article;
        }
      }),
    );

    return NextResponse.json({ articles: analyzedArticles });
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 },
    );
  }
}
