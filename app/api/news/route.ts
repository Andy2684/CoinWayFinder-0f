import { NextResponse } from "next/server"

// Mock news data
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High",
    summary: "Bitcoin surpassed $100,000 for the first time, driven by institutional adoption and ETF approvals.",
    url: "https://example.com/news/1",
    source: "CryptoNews",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    sentiment: 0.8,
    impact: "high",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Increase",
    summary: "New protocol upgrade increases staking rewards by 15%, attracting more validators to the network.",
    url: "https://example.com/news/2",
    source: "EthereumDaily",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sentiment: 0.6,
    impact: "medium",
  },
  {
    id: "3",
    title: "Regulatory Clarity Boosts Market Confidence",
    summary: "New regulatory framework provides clear guidelines for cryptocurrency operations.",
    url: "https://example.com/news/3",
    source: "RegulationToday",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    sentiment: 0.7,
    impact: "high",
  },
  {
    id: "4",
    title: "DeFi Protocol Launches New Yield Farming",
    summary: "Popular DeFi protocol introduces innovative yield farming mechanism with higher returns.",
    url: "https://example.com/news/4",
    source: "DeFiWeekly",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    sentiment: 0.5,
    impact: "medium",
  },
]

export async function GET() {
  try {
    // Sort by publishedAt (most recent first)
    const sortedNews = mockNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return NextResponse.json({
      news: sortedNews,
      total: sortedNews.length,
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
