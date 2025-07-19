import { type NextRequest, NextResponse } from "next/server"

// Mock news data
const MOCK_NEWS = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
    summary:
      "Bitcoin has broken through previous resistance levels, reaching a new all-time high of $75,000 as major institutions continue to add BTC to their balance sheets.",
    content:
      "Bitcoin has achieved a significant milestone today, breaking through the $75,000 barrier for the first time in its history. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing Bitcoin purchases. The cryptocurrency market has responded positively, with total market capitalization exceeding $2.8 trillion. Analysts attribute this growth to improved regulatory clarity and growing acceptance of Bitcoin as a store of value. Major financial institutions have also begun offering Bitcoin custody services, further legitimizing the asset class.",
    source: "CryptoNews Daily",
    url: "https://example.com/bitcoin-ath",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment_score: 0.8,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional", "Bullish"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Increase Following Network Upgrade",
    summary:
      "The latest Ethereum network upgrade has resulted in higher staking rewards for validators, with APY increasing to 6.2%.",
    content:
      "Ethereum validators are now earning higher rewards following the successful implementation of the latest network upgrade. The annual percentage yield (APY) for staking ETH has increased from 4.8% to 6.2%, making it more attractive for long-term holders to participate in network security. This upgrade also includes improvements to transaction processing speed and reduced gas fees during peak usage periods. The Ethereum Foundation reports that over 32 million ETH is now staked, representing approximately 26% of the total supply.",
    source: "Ethereum Weekly",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["Ethereum", "Staking", "Upgrade", "Rewards"],
  },
  {
    id: "3",
    title: "DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary:
      "A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.",
    content:
      "A significant security breach has occurred in the DeFi space, with a popular lending protocol losing $50 million to an exploit. The attack utilized a reentrancy vulnerability that allowed the attacker to drain funds from the protocol's liquidity pools. The protocol team has paused all operations and is working with security firms to assess the damage. This incident highlights the ongoing security challenges in DeFi, where smart contract vulnerabilities can lead to substantial losses. Users are advised to withdraw their funds from similar protocols until security audits are completed.",
    source: "DeFi Security Report",
    url: "https://example.com/defi-exploit",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: -0.7,
    impact_score: 8,
    tags: ["DeFi", "Security", "Exploit", "Smart Contract"],
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilot Program Shows Promising Results",
    summary:
      "The Federal Reserve's CBDC pilot program has completed its first phase, showing improved transaction efficiency and reduced costs.",
    content:
      "The Federal Reserve has released preliminary results from its Central Bank Digital Currency (CBDC) pilot program, indicating significant improvements in transaction processing and cost reduction. The pilot, conducted with select financial institutions, demonstrated 40% faster settlement times and 60% lower transaction costs compared to traditional banking systems. Privacy concerns remain a key focus, with the Fed emphasizing that the digital dollar would maintain user privacy while providing regulatory oversight. The next phase will expand testing to include retail transactions and cross-border payments.",
    source: "Federal Reserve Bulletin",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.3,
    impact_score: 6,
    tags: ["CBDC", "Federal Reserve", "Digital Currency", "Pilot"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery with 25% Volume Increase",
    summary:
      "The NFT marketplace has experienced a 25% increase in trading volume over the past week, signaling potential market recovery.",
    content:
      "After months of declining activity, the NFT market is showing signs of recovery with a 25% increase in trading volume over the past week. This uptick is attributed to new utility-focused projects and improved market sentiment. Major marketplaces report increased user engagement and higher average sale prices. Gaming NFTs and utility tokens are leading the recovery, while profile picture collections remain subdued. Industry experts suggest this could be the beginning of a more sustainable NFT market focused on real-world utility rather than speculation.",
    source: "NFT Market Analysis",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.4,
    impact_score: 5,
    tags: ["NFT", "Recovery", "Trading Volume", "Utility"],
  },
  {
    id: "6",
    title: "Regulatory Clarity Boosts Crypto Exchange Listings in Major Markets",
    summary:
      "New regulatory frameworks in the EU and Asia have led to increased cryptocurrency exchange listings and institutional participation.",
    content:
      "The implementation of comprehensive cryptocurrency regulations in the European Union and several Asian markets has resulted in a surge of new exchange listings and institutional participation. The Markets in Crypto-Assets (MiCA) regulation in the EU has provided clear guidelines for crypto operations, leading to increased confidence among traditional financial institutions. Major banks are now offering cryptocurrency custody services, and several new crypto ETFs have been approved. This regulatory clarity is expected to drive further institutional adoption and market maturation.",
    source: "Regulatory Crypto News",
    url: "https://example.com/regulatory-clarity",
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    sentiment_score: 0.7,
    impact_score: 8,
    tags: ["Regulation", "MiCA", "Institutional", "Exchanges"],
  },
  {
    id: "7",
    title: "Layer 2 Solutions See Record Adoption as Gas Fees Remain High",
    summary:
      "Ethereum Layer 2 solutions have processed over 1 million transactions daily as users seek alternatives to high mainnet fees.",
    content:
      "Ethereum Layer 2 scaling solutions have reached a new milestone, processing over 1 million transactions daily as users migrate from the expensive mainnet. Arbitrum and Optimism lead in transaction volume, while Polygon continues to dominate in user adoption. The average transaction cost on Layer 2 networks is now 95% lower than Ethereum mainnet, making DeFi and NFT activities more accessible to retail users. This trend is expected to continue as more protocols deploy on Layer 2 solutions and cross-chain bridges improve interoperability.",
    source: "Layer 2 Analytics",
    url: "https://example.com/layer2-adoption",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    sentiment_score: 0.5,
    impact_score: 6,
    tags: ["Layer 2", "Scaling", "Gas Fees", "Arbitrum", "Optimism"],
  },
  {
    id: "8",
    title: "Crypto Mining Industry Shifts Toward Renewable Energy Sources",
    summary:
      "Major cryptocurrency mining operations are transitioning to renewable energy, with 60% now using sustainable power sources.",
    content:
      "The cryptocurrency mining industry has made significant progress in adopting renewable energy sources, with recent studies showing that 60% of mining operations now use sustainable power. This shift is driven by both environmental concerns and economic incentives, as renewable energy often provides lower long-term costs. Solar and wind power installations specifically designed for mining operations are becoming increasingly common. The Bitcoin Mining Council reports that the network's sustainable energy mix has improved by 15% over the past year, addressing one of the main criticisms of cryptocurrency mining.",
    source: "Green Mining Report",
    url: "https://example.com/green-mining",
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["Mining", "Renewable Energy", "Sustainability", "Bitcoin"],
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
    console.error("Get news error:", error)
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
