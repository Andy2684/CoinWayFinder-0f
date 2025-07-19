import { NextResponse } from "next/server"

// Mock news data for when database is not available
const MOCK_NEWS = [
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
    summary: "Ethereum validators are earning unprecedented rewards as network activity surges.",
    content:
      "Ethereum 2.0 validators are experiencing record-high staking rewards as network activity reaches new peaks. The combination of increased transaction fees and MEV rewards has made staking more attractive than ever. With over 32 million ETH now staked, the network's security continues to strengthen.",
    source: "EthereumDaily",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["Ethereum", "Staking", "DeFi"],
  },
  {
    id: 3,
    title: "Major DeFi Protocol Suffers $50M Exploit",
    summary: "A popular DeFi lending protocol has been exploited, resulting in significant losses.",
    content:
      "A major DeFi lending protocol has suffered a $50 million exploit due to a smart contract vulnerability. The attack involved a complex flash loan manipulation that drained funds from the protocol's liquidity pools. The team has paused the protocol and is working with security firms to investigate the incident.",
    source: "DeFiWatch",
    url: "https://example.com/defi-exploit",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: -0.7,
    impact_score: 8,
    tags: ["DeFi", "Security", "Exploit"],
  },
  {
    id: 4,
    title: "Central Bank Digital Currency Pilot Program Launches",
    summary: "A major central bank has launched a pilot program for its digital currency.",
    content:
      "The Federal Reserve has announced the launch of a pilot program for a Central Bank Digital Currency (CBDC). The program will test the feasibility and implications of a digital dollar in controlled environments. This development could significantly impact the cryptocurrency landscape and traditional banking systems.",
    source: "FinanceToday",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.2,
    impact_score: 9,
    tags: ["CBDC", "Regulation", "Government"],
  },
  {
    id: 5,
    title: "NFT Market Shows Signs of Recovery",
    summary: "NFT trading volumes have increased significantly over the past week.",
    content:
      "The NFT market is showing signs of recovery with trading volumes increasing by 150% over the past week. Blue-chip collections are leading the recovery, with floor prices rising across major marketplaces. New utility-focused projects are gaining traction as the market matures beyond speculative trading.",
    source: "NFTInsider",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.5,
    impact_score: 6,
    tags: ["NFT", "Recovery", "Trading"],
  },
  {
    id: 6,
    title: "Layer 2 Solutions See Massive Adoption Growth",
    summary: "Ethereum Layer 2 networks are experiencing unprecedented user growth.",
    content:
      "Ethereum Layer 2 solutions are experiencing massive adoption growth, with total value locked (TVL) reaching new highs. Arbitrum and Optimism lead the charge with improved user experience and lower transaction costs. The growth signals a maturing ecosystem that's addressing Ethereum's scalability challenges.",
    source: "Layer2News",
    url: "https://example.com/layer2-growth",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    sentiment_score: 0.7,
    impact_score: 7,
    tags: ["Layer2", "Ethereum", "Scaling"],
  },
  {
    id: 7,
    title: "Crypto Regulation Framework Proposed",
    summary: "New comprehensive regulatory framework for cryptocurrencies has been proposed.",
    content:
      "Lawmakers have proposed a comprehensive regulatory framework for cryptocurrencies that aims to provide clarity while fostering innovation. The framework addresses key areas including stablecoin regulation, DeFi oversight, and consumer protection measures. Industry leaders have responded positively to the balanced approach.",
    source: "RegulatoryUpdate",
    url: "https://example.com/crypto-regulation",
    published_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    sentiment_score: 0.3,
    impact_score: 8,
    tags: ["Regulation", "Policy", "Government"],
  },
  {
    id: 8,
    title: "Institutional Crypto Custody Solutions Expand",
    summary: "Major financial institutions are expanding their cryptocurrency custody offerings.",
    content:
      "Several major financial institutions have announced expansions to their cryptocurrency custody solutions, signaling growing institutional demand. The services now support a wider range of digital assets and offer enhanced security features. This development is expected to accelerate institutional adoption of cryptocurrencies.",
    source: "InstitutionalCrypto",
    url: "https://example.com/custody-expansion",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["Institutional", "Custody", "Adoption"],
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "published_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

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
      let aValue, bValue

      switch (sortBy) {
        case "sentiment_score":
          aValue = a.sentiment_score
          bValue = b.sentiment_score
          break
        case "impact_score":
          aValue = a.impact_score
          bValue = b.impact_score
          break
        case "published_at":
        default:
          aValue = new Date(a.published_at).getTime()
          bValue = new Date(b.published_at).getTime()
          break
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    return NextResponse.json({
      success: true,
      data: filteredNews,
      total: filteredNews.length,
    })
  } catch (error) {
    console.error("News API error:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: MOCK_NEWS,
      total: MOCK_NEWS.length,
      note: "Using mock data - database not available",
    })
  }
}
