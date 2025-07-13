import { type NextRequest, NextResponse } from "next/server"

// Mock news data - in production, this would fetch from actual news APIs
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
    content:
      "Bitcoin has surged to unprecedented levels as major corporations and financial institutions continue to embrace cryptocurrency...",
    source: "CryptoNews",
    publishedAt: "2024-01-23T10:30:00Z",
    sentiment: 0.8,
    category: "bitcoin",
    image: "/placeholder.jpg",
    url: "https://example.com/news/1",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record High",
    content:
      "Ethereum staking has become increasingly profitable as network activity surges and more validators join the network...",
    source: "BlockchainDaily",
    publishedAt: "2024-01-23T08:15:00Z",
    sentiment: 0.6,
    category: "ethereum",
    image: "/placeholder.jpg",
    url: "https://example.com/news/2",
  },
  {
    id: "3",
    title: "Regulatory Clarity Boosts Altcoin Market",
    content:
      "Recent regulatory announcements have provided much-needed clarity for the cryptocurrency market, leading to significant gains...",
    source: "CryptoRegulator",
    publishedAt: "2024-01-23T06:45:00Z",
    sentiment: 0.4,
    category: "regulation",
    image: "/placeholder.jpg",
    url: "https://example.com/news/3",
  },
  {
    id: "4",
    title: "DeFi Protocol Faces Security Concerns",
    content: "A popular DeFi protocol has paused operations following reports of potential security vulnerabilities...",
    source: "DeFiWatch",
    publishedAt: "2024-01-22T20:30:00Z",
    sentiment: -0.3,
    category: "defi",
    image: "/placeholder.jpg",
    url: "https://example.com/news/4",
  },
  {
    id: "5",
    title: "Major Exchange Announces New Trading Features",
    content:
      "Leading cryptocurrency exchange introduces advanced trading tools and lower fees for institutional clients...",
    source: "TradingNews",
    publishedAt: "2024-01-22T18:00:00Z",
    sentiment: 0.5,
    category: "exchange",
    image: "/placeholder.jpg",
    url: "https://example.com/news/5",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let filteredNews = mockNews

    // Filter by category if provided
    if (category && category !== "all") {
      filteredNews = mockNews.filter((news) => news.category === category)
    }

    // Limit results
    filteredNews = filteredNews.slice(0, limit)

    return NextResponse.json({
      news: filteredNews,
      total: filteredNews.length,
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // In production, this would fetch and analyze the article
    const mockAnalysis = {
      title: "Analyzed Article Title",
      sentiment: Math.random() * 2 - 1, // Random sentiment between -1 and 1
      summary: "This is a mock analysis of the provided article URL.",
      keyPoints: [
        "Market sentiment is currently positive",
        "Trading volume has increased significantly",
        "Technical indicators suggest bullish trend",
      ],
    }

    return NextResponse.json({ analysis: mockAnalysis })
  } catch (error) {
    console.error("Error analyzing news:", error)
    return NextResponse.json({ error: "Failed to analyze news article" }, { status: 500 })
  }
}
