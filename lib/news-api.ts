interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  sentiment?: "positive" | "negative" | "neutral"
  category: string
  imageUrl?: string
}

// Mock news data as fallback
const mockNewsData: NewsArticle[] = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $73,000",
    summary: "Bitcoin surged to a new record high, driven by institutional adoption and ETF inflows.",
    url: "https://example.com/bitcoin-ath",
    source: "CoinDesk",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sentiment: "positive",
    category: "Bitcoin",
    imageUrl: "/placeholder.svg?height=200&width=400&text=Bitcoin+ATH",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    summary: "Ethereum staking yields reach new highs as network activity increases significantly.",
    url: "https://example.com/eth-staking",
    source: "CoinTelegraph",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    sentiment: "positive",
    category: "Ethereum",
    imageUrl: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
  },
  {
    id: "3",
    title: "Major Exchange Announces New DeFi Trading Features",
    summary: "Leading cryptocurrency exchange introduces advanced DeFi trading tools for retail investors.",
    url: "https://example.com/defi-trading",
    source: "CryptoPanic",
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    sentiment: "neutral",
    category: "DeFi",
    imageUrl: "/placeholder.svg?height=200&width=400&text=DeFi+Trading",
  },
]

export async function fetchCryptoNews(): Promise<NewsArticle[]> {
  try {
    // Try CryptoPanic API first
    if (process.env.CRYPTOPANIC_API_KEY) {
      const response = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${process.env.CRYPTOPANIC_API_KEY}&public=true&kind=news&filter=hot`,
      )

      if (response.ok) {
        const data = await response.json()
        return (
          data.results?.slice(0, 10).map((item: any, index: number) => ({
            id: item.id?.toString() || index.toString(),
            title: item.title || "No title",
            summary: item.title || "No summary available",
            url: item.url || "#",
            source: item.source?.title || "CryptoPanic",
            publishedAt: item.published_at || new Date().toISOString(),
            sentiment:
              item.votes?.positive > item.votes?.negative
                ? "positive"
                : item.votes?.negative > item.votes?.positive
                  ? "negative"
                  : "neutral",
            category: item.currencies?.[0]?.title || "General",
            imageUrl: "/placeholder.svg?height=200&width=400&text=Crypto+News",
          })) || []
        )
      }
    }

    // Try NewsData.io API as fallback
    if (process.env.NEWSDATA_API_KEY) {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=cryptocurrency&language=en&category=business`,
      )

      if (response.ok) {
        const data = await response.json()
        return (
          data.results?.slice(0, 10).map((item: any, index: number) => ({
            id: item.article_id || index.toString(),
            title: item.title || "No title",
            summary: item.description || item.content?.substring(0, 200) || "No summary available",
            url: item.link || "#",
            source: item.source_id || "NewsData",
            publishedAt: item.pubDate || new Date().toISOString(),
            sentiment: "neutral" as const,
            category: "Cryptocurrency",
            imageUrl: item.image_url || "/placeholder.svg?height=200&width=400&text=Crypto+News",
          })) || []
        )
      }
    }

    // Fallback to RSS feeds
    const rssFeeds = ["https://cointelegraph.com/rss", "https://www.coindesk.com/arc/outboundfeeds/rss/"]

    // For now, return mock data as RSS parsing would require additional setup
    return mockNewsData
  } catch (error) {
    console.error("Error fetching crypto news:", error)
    return mockNewsData
  }
}

export async function fetchMarketSentiment(): Promise<{
  overall: "bullish" | "bearish" | "neutral"
  score: number
  indicators: Array<{ name: string; value: number; trend: "up" | "down" | "stable" }>
}> {
  try {
    // Mock sentiment data
    return {
      overall: "bullish",
      score: 72,
      indicators: [
        { name: "Fear & Greed Index", value: 68, trend: "up" },
        { name: "Social Sentiment", value: 75, trend: "up" },
        { name: "News Sentiment", value: 73, trend: "stable" },
        { name: "Technical Analysis", value: 71, trend: "up" },
      ],
    }
  } catch (error) {
    console.error("Error fetching market sentiment:", error)
    return {
      overall: "neutral",
      score: 50,
      indicators: [],
    }
  }
}
