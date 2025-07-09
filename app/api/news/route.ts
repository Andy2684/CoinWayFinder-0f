import { type NextRequest, NextResponse } from "next/server"
import { newsAPIManager, whaleTracker } from "@/lib/news-api"
import { adminManager } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const includeWhales = searchParams.get("whales") === "true"

    // Check for admin session
    const adminToken = request.cookies.get("admin-token")?.value
    const adminSession = adminToken ? adminManager.verifyAdminToken(adminToken) : null

    let articles: any[] = []

    // Fetch news based on category
    if (category === "all" || category === "crypto") {
      const cryptoNews = await newsAPIManager.fetchCryptoNews(Math.ceil(limit * 0.6))
      articles = [...articles, ...cryptoNews]
    }

    if (category === "all" || category === "stocks") {
      const stockNews = await newsAPIManager.fetchStockNews(Math.ceil(limit * 0.2))
      articles = [...articles, ...stockNews]
    }

    if (category === "all" || category === "economy") {
      const economyNews = await newsAPIManager.fetchEconomyNews(Math.ceil(limit * 0.2))
      articles = [...articles, ...economyNews]
    }

    // Sort by published date (most recent first)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Limit results
    articles = articles.slice(0, limit)

    // Analyze sentiment with AI (optional)
    if (process.env.OPENAI_API_KEY) {
      articles = await newsAPIManager.analyzeNewsSentiment(articles)
    }

    const response: any = {
      success: true,
      articles,
      total: articles.length,
      category,
      timestamp: new Date().toISOString(),
    }

    // Include whale data if requested and user has access
    if (includeWhales && (adminSession?.isAdmin || category === "crypto")) {
      const whaleTransactions = await whaleTracker.getRecentWhaleTransactions(10)
      const smartWallets = await whaleTracker.getSmartMoneyWallets(5)

      response.whaleData = {
        recentTransactions: whaleTransactions,
        smartWallets: smartWallets,
        totalTransactions: whaleTransactions.length,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
        articles: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
