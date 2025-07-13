import { type NextRequest, NextResponse } from "next/server"

// Mock news data
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $100,000",
    summary:
      "Bitcoin has surged past the $100,000 milestone for the first time in history, driven by institutional adoption and regulatory clarity.",
    content:
      "In a historic moment for cryptocurrency, Bitcoin has broken through the $100,000 barrier, marking a significant milestone in its journey from a niche digital asset to a mainstream store of value. The surge comes amid increased institutional adoption, with major corporations adding Bitcoin to their treasury reserves and traditional financial institutions launching Bitcoin-focused products.",
    source: "CryptoNews",
    author: "Sarah Johnson",
    publishedAt: "2024-01-15T10:30:00Z",
    url: "https://example.com/bitcoin-100k",
    sentiment: "positive",
    tags: ["bitcoin", "price", "milestone", "institutional"],
    impact: "high",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Increase to 5.2% APY",
    summary:
      "The Ethereum network has seen staking rewards climb to 5.2% annually as more validators join the network.",
    content:
      "Ethereum staking rewards have reached 5.2% APY, the highest level since the network's transition to proof-of-stake. This increase is attributed to higher network activity and transaction fees, making staking more attractive for long-term holders.",
    source: "EthereumDaily",
    author: "Mike Chen",
    publishedAt: "2024-01-15T09:15:00Z",
    url: "https://example.com/eth-staking",
    sentiment: "positive",
    tags: ["ethereum", "staking", "rewards", "pos"],
    impact: "medium",
  },
  {
    id: "3",
    title: "SEC Approves First Solana ETF Application",
    summary:
      "The Securities and Exchange Commission has approved the first Solana-based exchange-traded fund, opening new investment avenues.",
    content:
      "In a groundbreaking decision, the SEC has approved the first Solana ETF, marking a significant step forward for alternative cryptocurrency investments. The approval comes after months of regulatory discussions and represents growing acceptance of diverse blockchain ecosystems.",
    source: "RegulatorWatch",
    author: "David Kim",
    publishedAt: "2024-01-15T08:45:00Z",
    url: "https://example.com/solana-etf",
    sentiment: "positive",
    tags: ["solana", "etf", "sec", "regulation"],
    impact: "high",
  },
  {
    id: "4",
    title: "DeFi Protocol Suffers $50M Exploit Due to Smart Contract Bug",
    summary:
      "A major DeFi protocol has lost $50 million in a sophisticated exploit targeting a vulnerability in its smart contract code.",
    content:
      "A prominent DeFi protocol has fallen victim to a $50 million exploit, highlighting ongoing security challenges in decentralized finance. The attack exploited a reentrancy vulnerability in the protocol's lending mechanism, allowing the attacker to drain funds before the system could update balances.",
    source: "DeFiSecurity",
    author: "Alex Rodriguez",
    publishedAt: "2024-01-15T07:20:00Z",
    url: "https://example.com/defi-exploit",
    sentiment: "negative",
    tags: ["defi", "security", "exploit", "smart-contract"],
    impact: "high",
  },
  {
    id: "5",
    title: "Central Bank Digital Currency Pilot Program Launches in 5 Countries",
    summary:
      "Five major economies have simultaneously launched CBDC pilot programs, testing digital versions of their national currencies.",
    content:
      "A coordinated effort by five central banks has launched comprehensive CBDC pilot programs, testing the feasibility of digital national currencies. The programs will evaluate cross-border payments, monetary policy implementation, and financial inclusion benefits.",
    source: "CentralBankNews",
    author: "Emma Thompson",
    publishedAt: "2024-01-15T06:00:00Z",
    url: "https://example.com/cbdc-pilot",
    sentiment: "neutral",
    tags: ["cbdc", "central-bank", "digital-currency", "pilot"],
    impact: "medium",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const sentiment = searchParams.get("sentiment")
    const tag = searchParams.get("tag")

    let filteredNews = [...mockNews]

    // Filter by sentiment
    if (sentiment) {
      filteredNews = filteredNews.filter((news) => news.sentiment === sentiment)
    }

    // Filter by tag
    if (tag) {
      filteredNews = filteredNews.filter((news) => news.tags.includes(tag))
    }

    // Sort by published date (newest first)
    filteredNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Paginate
    const paginatedNews = filteredNews.slice(offset, offset + limit)

    return NextResponse.json({
      news: paginatedNews,
      total: filteredNews.length,
      hasMore: offset + limit < filteredNews.length,
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newsData = await request.json()

    const newNews = {
      id: Date.now().toString(),
      ...newsData,
      publishedAt: new Date().toISOString(),
    }

    mockNews.unshift(newNews)

    return NextResponse.json(newNews, { status: 201 })
  } catch (error) {
    console.error("Error creating news:", error)
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
  }
}
