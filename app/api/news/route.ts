import { type NextRequest, NextResponse } from "next/server"
import { newsAPI } from "@/lib/news-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category") || "all"

    const articles = await newsAPI.getCryptoNews(limit)

    // Filter by category if specified
    const filteredArticles = category === "all" ? articles : articles.filter((article) => article.category === category)

    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      total: filteredArticles.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
