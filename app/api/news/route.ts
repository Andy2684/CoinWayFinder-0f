import { type NextRequest, NextResponse } from "next/server"
import { fetchCryptoNews, fetchMarketSentiment } from "@/lib/news-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const includeSentiment = searchParams.get("sentiment") === "true"

    const [news, sentiment] = await Promise.all([
      fetchCryptoNews(),
      includeSentiment ? fetchMarketSentiment() : Promise.resolve(null),
    ])

    let filteredNews = news
    if (category && category !== "all") {
      filteredNews = news.filter((article) => article.category.toLowerCase().includes(category.toLowerCase()))
    }

    const limitedNews = filteredNews.slice(0, limit)

    return NextResponse.json({
      news: limitedNews,
      sentiment,
      total: filteredNews.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
