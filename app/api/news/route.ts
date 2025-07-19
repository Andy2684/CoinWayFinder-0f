import { type NextRequest, NextResponse } from "next/server"

// Mock news data
const MOCK_NEWS = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
    summary:
      "Bitcoin surged to unprecedented levels as major corporations announce treasury allocations and ETF approvals drive institutional demand.",
    content:
      "Bitcoin has reached a new all-time high of $73,000, driven by unprecedented institutional adoption and regulatory clarity. Major corporations including MicroStrategy and Tesla have announced significant treasury allocations to Bitcoin, while the approval of multiple Bitcoin ETFs has opened the floodgates for institutional investment. Market analysts predict continued growth as traditional finance embraces digital assets.",
    source: "CryptoNews Daily",
    url: "https://example.com/bitcoin-ath",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment_score: 0.8,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional", "ETF"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    summary:
      "Ethereum validators are earning unprecedented rewards as network activity surges and staking participation reaches new milestones.",
    content:
      "Ethereum 2.0 validators are experiencing record-high staking rewards as network activity continues to surge. With over 32 million ETH now staked, representing nearly 27% of the total supply, validators are earning annual yields of up to 8.5%. The increased activity is attributed to growing DeFi adoption and the upcoming Shanghai upgrade.",
    source: "DeFi Pulse",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["Ethereum", "Staking", "DeFi", "Rewards"],
  },
  {
    id: "3",
    title: "Major Exchange Hack Results in $100M Loss",
    summary:
      "A sophisticated attack on a major cryptocurrency exchange has resulted in significant losses, raising concerns about security practices.",
    content:
      "A major cryptocurrency exchange suffered a devastating hack resulting in the loss of over $100 million in various digital assets. The attack, which appears to have exploited a vulnerability in the exchange's hot wallet infrastructure, has prompted an immediate halt to all trading activities. The exchange has assured users that cold storage funds remain secure and has initiated a comprehensive security audit.",
    source: "Blockchain Security",
    url: "https://example.com/exchange-hack",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: -0.9,
    impact_score: 8,
    tags: ["Security", "Hack", "Exchange", "Risk"],
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilot Program Launches",
    summary:
      "A major central bank has announced the launch of its digital currency pilot program, marking a significant step toward mainstream adoption.",
    content:
      "The Federal Reserve has officially launched its Central Bank Digital Currency (CBDC) pilot program, partnering with select financial institutions to test digital dollar transactions. The six-month pilot will evaluate the feasibility, security, and economic impact of a digital dollar. This development represents a significant step toward the mainstream adoption of digital currencies by traditional financial institutions.",
    source: "Financial Times Crypto",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.4,
    impact_score: 8,
    tags: ["CBDC", "Federal Reserve", "Digital Dollar", "Regulation"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery",
    summary:
      "After months of decline, the NFT market is showing renewed interest with increased trading volumes and new project launches.",
    content:
      "The NFT market is experiencing a resurgence after months of declining activity. Trading volumes have increased by 45% over the past week, driven by new utility-focused projects and renewed interest from collectors. Major platforms report increased user engagement and several high-profile collections have seen significant price appreciation.",
    source: "NFT Insider",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    sentiment_score: 0.5,
    impact_score: 5,
    tags: ["NFT", "Recovery", "Trading", "Collections"],
  },
  {
    id: "6",
    title: "DeFi Protocol Introduces Revolutionary Yield Farming",
    summary:
      "A new DeFi protocol has launched with innovative yield farming mechanisms that promise higher returns with reduced risk.",
    content:
      "DeFiMax, a new decentralized finance protocol, has introduced a revolutionary yield farming mechanism that uses advanced algorithms to optimize returns while minimizing impermanent loss. The protocol's unique approach to liquidity provision has attracted over $50 million in total value locked within its first week of launch.",
    source: "DeFi Weekly",
    url: "https://example.com/defi-yield",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.7,
    impact_score: 6,
    tags: ["DeFi", "Yield Farming", "Innovation", "TVL"],
  },
  {
    id: "7",
    title: "Regulatory Clarity Boosts Crypto Market Confidence",
    summary:
      "New regulatory guidelines provide much-needed clarity for cryptocurrency operations, boosting market confidence and institutional adoption.",
    content:
      "The Securities and Exchange Commission has released comprehensive guidelines for cryptocurrency operations, providing the regulatory clarity that the industry has long sought. The guidelines establish clear frameworks for token classification, exchange operations, and institutional custody services. Market participants have responded positively, with several major announcements expected in the coming weeks.",
    source: "Regulatory Watch",
    url: "https://example.com/regulatory-clarity",
    published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    sentiment_score: 0.8,
    impact_score: 9,
    tags: ["Regulation", "SEC", "Clarity", "Institutional"],
  },
  {
    id: "8",
    title: "Layer 2 Solutions See Massive Adoption Growth",
    summary:
      "Ethereum Layer 2 solutions are experiencing unprecedented growth as users seek faster and cheaper transaction alternatives.",
    content:
      "Ethereum Layer 2 solutions have seen explosive growth, with total value locked increasing by over 200% in the past month. Arbitrum and Optimism lead the charge, processing millions of transactions daily at a fraction of mainnet costs. The growth is attributed to improved user experience and the migration of major DeFi protocols to Layer 2 networks.",
    source: "Layer 2 Analytics",
    url: "https://example.com/layer2-growth",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    sentiment_score: 0.9,
    impact_score: 7,
    tags: ["Layer 2", "Ethereum", "Scaling", "Arbitrum"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "date"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let filteredNews = [...MOCK_NEWS]

    // Apply search filter
    if (search) {
      filteredNews = filteredNews.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          article.summary.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.tags.some((tag) => tag.toLowerCase().includes(search)),
      )
    }

    // Apply sentiment filter
    if (sentiment) {
      if (sentiment === "positive") {
        filteredNews = filteredNews.filter((article) => article.sentiment_score > 0.2)
      } else if (sentiment === "negative") {
        filteredNews = filteredNews.filter((article) => article.sentiment_score < -0.2)
      } else if (sentiment === "neutral") {
        filteredNews = filteredNews.filter(
          (article) => article.sentiment_score >= -0.2 && article.sentiment_score <= 0.2,
        )
      }
    }

    // Apply sorting
    filteredNews.sort((a, b) => {
      switch (sortBy) {
        case "sentiment":
          return b.sentiment_score - a.sentiment_score
        case "impact":
          return b.impact_score - a.impact_score
        case "date":
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }
    })

    // Apply limit
    filteredNews = filteredNews.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredNews,
      total: filteredNews.length,
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
        data: MOCK_NEWS.slice(0, 8), // Fallback to mock data
      },
      { status: 500 },
    )
  }
}
