export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  fetchCryptoNews,
  fetchStockNews,
  fetchEconomyNews,
  analyzeNewsSentiment,
} from "@/lib/news-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const limit = Number.parseInt(searchParams.get("limit") || "20");

    let articles: any[] = [];

    // Fetch news based on category
    if (category === "all" || category === "crypto") {
      const cryptoNews = await fetchCryptoNews();
      articles = [...articles, ...cryptoNews];
    }

    if (category === "all" || category === "stocks") {
      const stockNews = await fetchStockNews();
      articles = [...articles, ...stockNews];
    }

    if (category === "all" || category === "economy") {
      const economyNews = await fetchEconomyNews();
      articles = [...articles, ...economyNews];
    }

    // Sort by published date (most recent first)
    articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    // Limit results
    articles = articles.slice(0, limit);

    // Analyze sentiment with AI (optional)
    if (process.env.OPENAI_API_KEY) {
      articles = await analyzeNewsSentiment(articles);
    }

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
