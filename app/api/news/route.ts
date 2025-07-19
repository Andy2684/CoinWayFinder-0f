import { type NextRequest, NextResponse } from "next/server"

// Mock news data with realistic crypto news
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $75,000",
    summary: "Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.",
    content:
      "Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency's journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence.",
    source: "CryptoNews",
    author: "Sarah Johnson",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    url: "https://example.com/bitcoin-ath",
    image_url: "/placeholder.svg?height=200&width=400&text=Bitcoin+ATH",
    sentiment: "positive" as const,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional", "Bullish"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    summary: "Ethereum staking yields reach new highs as network activity surges post-merge.",
    content:
      "Ethereum 2.0 staking rewards have reached record levels, with validators earning higher yields than ever before. The increased activity on the Ethereum network, combined with the successful transition to Proof of Stake, has created favorable conditions for stakers. Network fees and MEV rewards have contributed to the enhanced staking yields.",
    source: "EthereumDaily",
    author: "Michael Chen",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    url: "https://example.com/eth-staking",
    image_url: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
    sentiment: "positive" as const,
    impact_score: 7,
    tags: ["Ethereum", "Staking", "DeFi", "Yield"],
  },
  {
    id: "3",
    title: "Major DeFi Protocol Suffers $50M Exploit",
    summary: "A popular DeFi lending protocol lost $50 million in a sophisticated smart contract attack.",
    content:
      "A major DeFi lending protocol has suffered a $50 million exploit due to a vulnerability in its smart contract code. The attack involved a complex flash loan manipulation that drained funds from the protocol's liquidity pools. The team has paused the protocol and is working with security firms to investigate the incident.",
    source: "DeFiWatch",
    author: "Alex Rodriguez",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    url: "https://example.com/defi-exploit",
    image_url: "/placeholder.svg?height=200&width=400&text=DeFi+Exploit",
    sentiment: "negative" as const,
    impact_score: 8,
    tags: ["DeFi", "Security", "Exploit", "Flash Loan"],
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilot Launches",
    summary: "Major economy launches CBDC pilot program with retail and institutional participants.",
    content:
      "A major central bank has officially launched its Central Bank Digital Currency (CBDC) pilot program, involving both retail and institutional participants. The pilot will test various use cases including cross-border payments, retail transactions, and programmable money features. This represents a significant step toward mainstream digital currency adoption.",
    source: "FinanceToday",
    author: "Emma Thompson",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    url: "https://example.com/cbdc-pilot",
    image_url: "/placeholder.svg?height=200&width=400&text=CBDC+Launch",
    sentiment: "neutral" as const,
    impact_score: 6,
    tags: ["CBDC", "Central Bank", "Digital Currency", "Pilot"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery",
    summary: "NFT trading volumes increase 40% as new utility-focused projects gain traction.",
    content:
      "The NFT market is showing signs of recovery with trading volumes increasing by 40% over the past month. New utility-focused NFT projects are gaining traction, moving beyond simple profile pictures to offer real-world benefits and integration with DeFi protocols. Gaming NFTs and metaverse assets are leading the recovery.",
    source: "NFTInsider",
    author: "David Kim",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    url: "https://example.com/nft-recovery",
    image_url: "/placeholder.svg?height=200&width=400&text=NFT+Recovery",
    sentiment: "positive" as const,
    impact_score: 5,
    tags: ["NFT", "Recovery", "Gaming", "Utility"],
  },
  {
    id: "6",
    title: "Regulatory Clarity Boosts Crypto Adoption",
    summary: "New regulatory framework provides clear guidelines for crypto businesses and investors.",
    content:
      "New regulatory guidelines have provided much-needed clarity for the cryptocurrency industry. The comprehensive framework addresses key areas including custody, trading, and taxation of digital assets. Industry leaders praise the balanced approach that promotes innovation while ensuring consumer protection.",
    source: "RegulatoryNews",
    author: "Jennifer Walsh",
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    url: "https://example.com/crypto-regulation",
    image_url: "/placeholder.svg?height=200&width=400&text=Crypto+Regulation",
    sentiment: "positive" as const,
    impact_score: 8,
    tags: ["Regulation", "Compliance", "Adoption", "Framework"],
  },
  {
    id: "7",
    title: "Layer 2 Solutions See Massive Growth",
    summary: "Ethereum Layer 2 networks process record transaction volumes as fees remain low.",
    content:
      "Ethereum Layer 2 solutions have processed record transaction volumes while maintaining low fees. Optimistic rollups and zk-rollups are seeing increased adoption from both users and developers. The growth in Layer 2 activity demonstrates the success of Ethereum's scaling roadmap.",
    source: "Layer2Daily",
    author: "Robert Chang",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    url: "https://example.com/layer2-growth",
    image_url: "/placeholder.svg?height=200&width=400&text=Layer+2+Growth",
    sentiment: "positive" as const,
    impact_score: 6,
    tags: ["Layer 2", "Scaling", "Ethereum", "Rollups"],
  },
  {
    id: "8",
    title: "Crypto Market Volatility Concerns Investors",
    summary: "High volatility in crypto markets raises concerns about institutional adoption pace.",
    content:
      "Recent high volatility in cryptocurrency markets has raised concerns among institutional investors about the pace of adoption. While long-term fundamentals remain strong, short-term price swings continue to challenge risk management strategies. Analysts suggest that market maturity will eventually reduce volatility.",
    source: "MarketAnalysis",
    author: "Lisa Park",
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    url: "https://example.com/market-volatility",
    image_url: "/placeholder.svg?height=200&width=400&text=Market+Volatility",
    sentiment: "negative" as const,
    impact_score: 4,
    tags: ["Volatility", "Institutional", "Risk", "Markets"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "date"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredNews = [...mockNews]

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
    if (sentiment && sentiment !== "all") {
      filteredNews = filteredNews.filter((article) => article.sentiment === sentiment)
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filteredNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        break
      case "sentiment":
        const sentimentOrder = { positive: 3, neutral: 2, negative: 1 }
        filteredNews.sort((a, b) => sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment])
        break
      case "impact":
        filteredNews.sort((a, b) => b.impact_score - a.impact_score)
        break
    }

    // Apply pagination
    const paginatedNews = filteredNews.slice(offset, offset + limit)
    const total = filteredNews.length

    return NextResponse.json({
      success: true,
      data: paginatedNews,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 })
  }
}
