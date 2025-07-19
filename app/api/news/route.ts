import { type NextRequest, NextResponse } from "next/server"

// Mock news data for when database is not available
const mockNewsData = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Grows",
    summary:
      "Bitcoin surged to unprecedented levels as major corporations announce treasury allocations and ETF approvals drive mainstream adoption.",
    content:
      "Bitcoin has reached a new all-time high of $73,000 as institutional adoption continues to accelerate. Major corporations including MicroStrategy and Tesla have announced additional Bitcoin purchases for their treasury reserves. The recent approval of spot Bitcoin ETFs has also contributed to increased demand from traditional investors.",
    source: "CryptoNews",
    url: "https://example.com/bitcoin-ath",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment_score: 0.8,
    impact_score: 0.9,
    tags: ["Bitcoin", "BTC", "ATH", "Institutional", "ETF"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Increase Following Network Upgrade",
    summary:
      "The latest Ethereum network upgrade has resulted in higher staking rewards, attracting more validators to secure the network.",
    content:
      "Following the successful implementation of the latest Ethereum network upgrade, staking rewards have increased by 15%. This improvement has attracted thousands of new validators, further strengthening the network's security and decentralization.",
    source: "EthereumDaily",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.6,
    impact_score: 0.7,
    tags: ["Ethereum", "ETH", "Staking", "Upgrade", "Rewards"],
  },
  {
    id: "3",
    title: "Major Exchange Announces Support for New DeFi Protocols",
    summary:
      "Leading cryptocurrency exchange adds support for emerging DeFi protocols, expanding trading options for users.",
    content:
      "Binance has announced support for several new DeFi protocols, including advanced yield farming opportunities and liquidity mining programs. This expansion provides users with access to cutting-edge decentralized finance products directly through the exchange platform.",
    source: "DeFiTimes",
    url: "https://example.com/defi-support",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: 0.4,
    impact_score: 0.6,
    tags: ["DeFi", "Exchange", "Binance", "Yield Farming", "Liquidity"],
  },
  {
    id: "4",
    title: "Regulatory Clarity Boosts Crypto Market Confidence",
    summary:
      "New regulatory guidelines provide clearer framework for cryptocurrency operations, boosting investor confidence.",
    content:
      "The Securities and Exchange Commission has released comprehensive guidelines for cryptocurrency operations, providing much-needed regulatory clarity. This development has been welcomed by industry participants and has contributed to increased market confidence and institutional investment.",
    source: "RegulatoryWatch",
    url: "https://example.com/regulatory-clarity",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.7,
    impact_score: 0.8,
    tags: ["Regulation", "SEC", "Compliance", "Institutional", "Legal"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery with New Use Cases",
    summary:
      "The NFT market is experiencing renewed interest as developers explore utility-focused applications beyond digital art.",
    content:
      "After a period of decline, the NFT market is showing signs of recovery driven by innovative use cases in gaming, identity verification, and real-world asset tokenization. Several major brands have announced NFT initiatives focused on utility rather than speculation.",
    source: "NFTInsider",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.3,
    impact_score: 0.5,
    tags: ["NFT", "Gaming", "Utility", "Tokenization", "Recovery"],
  },
  {
    id: "6",
    title: "Central Bank Digital Currency Pilot Program Expands",
    summary:
      "Multiple central banks expand their CBDC pilot programs, testing digital currency implementations in real-world scenarios.",
    content:
      "The Federal Reserve, European Central Bank, and Bank of Japan have all announced expansions to their Central Bank Digital Currency pilot programs. These initiatives are testing the feasibility of digital currencies for everyday transactions and cross-border payments.",
    source: "CentralBankNews",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    sentiment_score: 0.2,
    impact_score: 0.7,
    tags: ["CBDC", "Central Bank", "Digital Currency", "Pilot", "Government"],
  },
  {
    id: "7",
    title: "Crypto Mining Industry Shifts Toward Renewable Energy",
    summary:
      "Major mining operations announce transition to renewable energy sources, addressing environmental concerns.",
    content:
      "Leading cryptocurrency mining companies have announced significant investments in renewable energy infrastructure. This shift addresses long-standing environmental concerns and positions the industry for sustainable long-term growth.",
    source: "GreenCrypto",
    url: "https://example.com/green-mining",
    published_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    sentiment_score: 0.5,
    impact_score: 0.6,
    tags: ["Mining", "Renewable Energy", "Environment", "Sustainability", "Green"],
  },
  {
    id: "8",
    title: "Layer 2 Solutions See Massive Growth in Transaction Volume",
    summary:
      "Ethereum Layer 2 networks report record transaction volumes as users seek lower fees and faster processing.",
    content:
      "Polygon, Arbitrum, and Optimism have all reported record transaction volumes as users migrate to Layer 2 solutions for lower fees and faster transaction processing. This growth demonstrates the increasing adoption of scaling solutions in the Ethereum ecosystem.",
    source: "Layer2News",
    url: "https://example.com/layer2-growth",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    sentiment_score: 0.6,
    impact_score: 0.7,
    tags: ["Layer 2", "Ethereum", "Scaling", "Polygon", "Arbitrum"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // For now, return mock data since database might not be set up
    const paginatedNews = mockNewsData.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedNews,
    })
  } catch (error) {
    console.error("Get news error:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: mockNewsData.slice(0, 20),
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, source, sentiment, url, publishedAt } = await request.json()

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    // For now, just return a mock response since database might not be set up
    const mockNewsItem = {
      id: Date.now().toString(),
      title,
      content: content || "",
      source: source || "User Submitted",
      sentiment: sentiment || "neutral",
      url: url || "",
      published_at: publishedAt || new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      news: mockNewsItem,
    })
  } catch (error) {
    console.error("Create news error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
