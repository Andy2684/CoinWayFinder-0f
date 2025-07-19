import { type NextRequest, NextResponse } from "next/server"

// Mock news data for when database is not available
const mockNewsData = [
  {
    id: 1,
    title: "Bitcoin Reaches New All-Time High Above $75,000",
    summary: "Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.",
    content:
      "Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency's journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence.",
    source: "CryptoNews",
    url: "https://example.com/bitcoin-ath",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment_score: 0.8,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional"],
  },
  {
    id: 2,
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    summary: "Ethereum staking yields reach new highs as network activity surges post-merge.",
    content:
      "Ethereum staking rewards have reached record levels following increased network activity and successful implementation of various protocol upgrades. The proof-of-stake consensus mechanism continues to attract validators, with over 32 million ETH now staked on the network. This represents a significant portion of the total ETH supply and demonstrates strong confidence in Ethereum's long-term prospects.",
    source: "EthereumDaily",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.7,
    impact_score: 7,
    tags: ["Ethereum", "Staking", "DeFi"],
  },
  {
    id: 3,
    title: "Major Exchange Faces Regulatory Scrutiny",
    summary: "Regulatory authorities launch investigation into trading practices at major cryptocurrency exchange.",
    content:
      "A major cryptocurrency exchange is facing increased regulatory scrutiny as authorities investigate potential violations of trading regulations. The investigation focuses on market manipulation concerns and compliance with anti-money laundering requirements. This development has raised questions about the regulatory landscape for cryptocurrency exchanges and the need for clearer guidelines in the industry.",
    source: "RegulatorWatch",
    url: "https://example.com/exchange-scrutiny",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: -0.6,
    impact_score: 8,
    tags: ["Regulation", "Exchange", "Compliance"],
  },
  {
    id: 4,
    title: "DeFi Protocol Launches Revolutionary Yield Farming Feature",
    summary: "New DeFi protocol introduces innovative yield farming mechanism with enhanced security features.",
    content:
      "A groundbreaking DeFi protocol has launched a revolutionary yield farming feature that promises higher returns with enhanced security measures. The protocol utilizes advanced smart contract architecture and multi-signature security to protect user funds while maximizing yield opportunities. Early adopters have reported impressive returns, though experts caution about the inherent risks in DeFi investments.",
    source: "DeFiInsider",
    url: "https://example.com/defi-yield",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.5,
    impact_score: 6,
    tags: ["DeFi", "Yield Farming", "Innovation"],
  },
  {
    id: 5,
    title: "NFT Market Shows Signs of Recovery",
    summary: "NFT trading volumes increase significantly as market sentiment improves.",
    content:
      "The NFT market is showing strong signs of recovery with trading volumes increasing by over 200% in the past month. Blue-chip collections are leading the recovery, with floor prices stabilizing and new projects gaining traction. Industry experts attribute the recovery to improved market conditions and renewed interest from both collectors and investors.",
    source: "NFTTracker",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.4,
    impact_score: 5,
    tags: ["NFT", "Recovery", "Trading"],
  },
  {
    id: 6,
    title: "Central Bank Digital Currency Pilot Program Expands",
    summary: "Major central bank expands CBDC pilot program to include more participants and use cases.",
    content:
      "A major central bank has announced the expansion of its Central Bank Digital Currency (CBDC) pilot program, adding more participants and exploring additional use cases. The expanded pilot will test cross-border payments, programmable money features, and integration with existing financial infrastructure. This development represents a significant step toward mainstream CBDC adoption.",
    source: "CentralBankNews",
    url: "https://example.com/cbdc-expansion",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    sentiment_score: 0.3,
    impact_score: 7,
    tags: ["CBDC", "Central Bank", "Digital Currency"],
  },
  {
    id: 7,
    title: "Crypto Mining Difficulty Reaches New Peak",
    summary: "Bitcoin mining difficulty adjusts upward as network hashrate continues to grow.",
    content:
      "Bitcoin mining difficulty has reached a new all-time high following the latest difficulty adjustment. The increase reflects the growing network hashrate as more miners join the network, demonstrating the robust security and decentralization of the Bitcoin network. Despite higher difficulty, mining remains profitable for efficient operations due to strong Bitcoin prices.",
    source: "MiningReport",
    url: "https://example.com/mining-difficulty",
    published_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    sentiment_score: 0.2,
    impact_score: 4,
    tags: ["Mining", "Bitcoin", "Network Security"],
  },
  {
    id: 8,
    title: "Altcoin Season Indicators Flash Mixed Signals",
    summary: "Market analysts debate whether current conditions indicate the start of altcoin season.",
    content:
      "Market analysts are divided on whether current market conditions indicate the beginning of altcoin season. While some altcoins have shown strong performance relative to Bitcoin, others remain subdued. Key indicators such as the altcoin market cap ratio and Bitcoin dominance are sending mixed signals, making it difficult to predict the next major market trend.",
    source: "AltcoinAnalysis",
    url: "https://example.com/altcoin-season",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    sentiment_score: 0.1,
    impact_score: 6,
    tags: ["Altcoins", "Market Analysis", "Trading"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const sentiment = searchParams.get("sentiment") || ""
    const sortBy = searchParams.get("sortBy") || "date"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let filteredNews = [...mockNewsData]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredNews = filteredNews.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.summary.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Apply sentiment filter
    if (sentiment) {
      filteredNews = filteredNews.filter((article) => {
        if (sentiment === "positive") return article.sentiment_score > 0.1
        if (sentiment === "negative") return article.sentiment_score < -0.1
        if (sentiment === "neutral") return article.sentiment_score >= -0.1 && article.sentiment_score <= 0.1
        return true
      })
    }

    // Apply sorting
    filteredNews.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "sentiment":
          aValue = a.sentiment_score
          bValue = b.sentiment_score
          break
        case "impact":
          aValue = a.impact_score
          bValue = b.impact_score
          break
        case "date":
        default:
          aValue = new Date(a.published_at).getTime()
          bValue = new Date(b.published_at).getTime()
          break
      }

      if (sortOrder === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return NextResponse.json({
      success: true,
      data: filteredNews,
      total: filteredNews.length,
    })
  } catch (error) {
    console.error("Get news error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
        data: mockNewsData, // Fallback to mock data
        total: mockNewsData.length,
      },
      { status: 200 }, // Return 200 with fallback data
    )
  }
}
