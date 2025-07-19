import { type NextRequest, NextResponse } from "next/server"

// Mock news data for when database is not available
const MOCK_NEWS = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $75,000",
    summary: "Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.",
    content:
      "Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency's journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence. Technical analysis suggests strong momentum with key resistance levels being broken decisively.",
    source: "CryptoNews Daily",
    sentiment: 0.8,
    impact: 9,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    url: "https://example.com/bitcoin-ath",
    tags: ["Bitcoin", "ATH", "Institutional", "Bullish"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    summary: "Ethereum validators are seeing unprecedented returns as network activity surges.",
    content:
      "Ethereum 2.0 validators are experiencing record-high staking rewards as network activity reaches new peaks. The combination of increased transaction fees and MEV (Maximum Extractable Value) opportunities has pushed annual percentage yields above 8% for many validators. This surge in rewards comes as Ethereum continues to dominate the DeFi and NFT spaces, driving consistent demand for block space and higher fee revenues.",
    source: "DeFi Analytics",
    sentiment: 0.7,
    impact: 7,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    url: "https://example.com/eth-staking",
    tags: ["Ethereum", "Staking", "DeFi", "Rewards"],
  },
  {
    id: "3",
    title: "Major Exchange Hack Results in $200M Loss",
    summary: "A sophisticated attack on a major cryptocurrency exchange has resulted in significant losses.",
    content:
      "A major cryptocurrency exchange has fallen victim to a sophisticated hack, resulting in the loss of approximately $200 million in various cryptocurrencies. The attack appears to have exploited a vulnerability in the exchange's hot wallet infrastructure. The exchange has immediately suspended all withdrawals and is working with cybersecurity firms and law enforcement to investigate the breach. Users are advised to change their passwords and enable additional security measures.",
    source: "Security Alert Network",
    sentiment: -0.9,
    impact: 8,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    url: "https://example.com/exchange-hack",
    tags: ["Security", "Hack", "Exchange", "Risk"],
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilot Program Launches",
    summary: "A major central bank has announced the launch of its CBDC pilot program.",
    content:
      "The Federal Reserve has officially launched its Central Bank Digital Currency (CBDC) pilot program, marking a significant step toward digital currency adoption at the institutional level. The pilot will test various use cases including cross-border payments, retail transactions, and interbank settlements. This development could have far-reaching implications for the broader cryptocurrency ecosystem and traditional banking infrastructure.",
    source: "Financial Times Crypto",
    sentiment: 0.3,
    impact: 6,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    url: "https://example.com/cbdc-pilot",
    tags: ["CBDC", "Federal Reserve", "Digital Currency", "Regulation"],
  },
  {
    id: "5",
    title: "DeFi Protocol Introduces Revolutionary Yield Farming",
    summary: "A new DeFi protocol promises sustainable high yields through innovative mechanisms.",
    content:
      "A groundbreaking DeFi protocol has launched with a revolutionary approach to yield farming that promises sustainable high returns without the typical risks associated with liquidity mining. The protocol uses a novel algorithmic approach to balance supply and demand, automatically adjusting rewards based on market conditions. Early adopters are reporting yields of 15-25% APY with significantly reduced impermanent loss risk.",
    source: "DeFi Pulse",
    sentiment: 0.6,
    impact: 5,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    url: "https://example.com/defi-yield",
    tags: ["DeFi", "Yield Farming", "Innovation", "APY"],
  },
  {
    id: "6",
    title: "NFT Market Shows Signs of Recovery",
    summary: "Trading volumes and floor prices are rising across major NFT collections.",
    content:
      "The NFT market is showing strong signs of recovery after months of declining activity. Major collections like CryptoPunks and Bored Ape Yacht Club have seen significant increases in floor prices and trading volumes. New utility-focused projects are gaining traction, suggesting a shift toward more sustainable NFT ecosystems. Gaming and metaverse applications continue to drive adoption and create real-world value for digital assets.",
    source: "NFT Tracker",
    sentiment: 0.5,
    impact: 4,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    url: "https://example.com/nft-recovery",
    tags: ["NFT", "Recovery", "Gaming", "Metaverse"],
  },
  {
    id: "7",
    title: "Regulatory Clarity Boosts Institutional Adoption",
    summary: "New regulatory guidelines provide clearer framework for institutional crypto investments.",
    content:
      "Recent regulatory developments have provided much-needed clarity for institutional investors looking to enter the cryptocurrency space. The new guidelines establish clear frameworks for custody, reporting, and compliance requirements. This regulatory clarity is expected to accelerate institutional adoption, with several major pension funds and endowments already announcing plans to allocate portions of their portfolios to digital assets.",
    source: "Institutional Crypto Report",
    sentiment: 0.7,
    impact: 7,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    url: "https://example.com/regulatory-clarity",
    tags: ["Regulation", "Institutional", "Compliance", "Adoption"],
  },
  {
    id: "8",
    title: "Layer 2 Solutions See Massive Growth in Usage",
    summary: "Ethereum Layer 2 networks are processing record transaction volumes.",
    content:
      "Ethereum Layer 2 solutions are experiencing unprecedented growth, with combined transaction volumes exceeding those of the main Ethereum network for the first time. Arbitrum, Optimism, and Polygon are leading the charge, offering users significantly lower fees and faster transaction times. This growth is driving innovation in DeFi applications and making Ethereum-based services more accessible to retail users worldwide.",
    source: "Layer 2 Analytics",
    sentiment: 0.8,
    impact: 6,
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    url: "https://example.com/layer2-growth",
    tags: ["Layer 2", "Scaling", "Ethereum", "Growth"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "timestamp"
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
    if (sentiment && sentiment !== "all") {
      filteredNews = filteredNews.filter((article) => {
        if (sentiment === "positive") return article.sentiment > 0.2
        if (sentiment === "negative") return article.sentiment < -0.2
        if (sentiment === "neutral") return article.sentiment >= -0.2 && article.sentiment <= 0.2
        return true
      })
    }

    // Apply sorting
    filteredNews.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      if (sortBy === "timestamp") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
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
    console.error("Get news error:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: MOCK_NEWS,
      total: MOCK_NEWS.length,
    })
  }
}
