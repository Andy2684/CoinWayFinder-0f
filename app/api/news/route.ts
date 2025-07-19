import { type NextRequest, NextResponse } from "next/server"

// Mock news data
const MOCK_NEWS = [
  {
    id: 1,
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
    summary:
      "Bitcoin has broken through previous resistance levels, reaching a new all-time high of $75,000 as major institutions continue to add BTC to their balance sheets.",
    content:
      "Bitcoin has achieved a historic milestone today, surpassing its previous all-time high to reach $75,000. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing significant Bitcoin purchases. The cryptocurrency market has responded positively, with total market capitalization exceeding $2.8 trillion. Analysts attribute this growth to improved regulatory clarity and growing acceptance of Bitcoin as a store of value. Major financial institutions have also begun offering Bitcoin custody services, further legitimizing the asset class.",
    source: "CryptoNews Daily",
    url: "https://example.com/bitcoin-ath",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment_score: 0.8,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional", "Bullish"],
  },
  {
    id: 2,
    title: "Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures",
    summary:
      "Ethereum staking rewards have decreased to 3.2% APY as the network becomes more decentralized with over 1 million validators participating.",
    content:
      "The Ethereum network has reached a new level of maturity with staking rewards dropping to a record low of 3.2% APY. This decrease is attributed to the growing number of validators, which now exceeds 1 million participants. While lower rewards might seem concerning, analysts view this as a positive sign of network decentralization and security. The total value locked in Ethereum 2.0 staking has surpassed $120 billion, representing approximately 25% of all ETH in circulation. This milestone demonstrates the community's long-term commitment to the network's proof-of-stake consensus mechanism.",
    source: "Ethereum Insights",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.3,
    impact_score: 6,
    tags: ["Ethereum", "Staking", "ETH2", "Decentralization"],
  },
  {
    id: 3,
    title: "DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary:
      "A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.",
    content:
      "A significant security breach has occurred in the DeFi space, with a popular lending protocol losing $50 million to an exploit. The attack utilized a reentrancy vulnerability that allowed the attacker to drain funds from the protocol's liquidity pools. The protocol team has immediately paused all operations and is working with security firms to assess the damage. This incident highlights the ongoing risks in DeFi protocols and the importance of thorough security audits. The exploit has caused the protocol's native token to drop by 40% in the past hour. Users are advised to withdraw their funds from similar protocols until further security measures are implemented.",
    source: "DeFi Security Watch",
    url: "https://example.com/defi-exploit",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: -0.9,
    impact_score: 8,
    tags: ["DeFi", "Security", "Exploit", "Smart Contract"],
  },
  {
    id: 4,
    title: "Central Bank Digital Currency Pilot Program Shows Promising Results",
    summary:
      "The Federal Reserve's CBDC pilot program has completed its first phase, showing improved transaction efficiency and reduced settlement times.",
    content:
      "The Federal Reserve has announced positive results from the first phase of its Central Bank Digital Currency (CBDC) pilot program. The digital dollar prototype demonstrated significant improvements in transaction processing speed and settlement efficiency compared to traditional banking systems. Transactions that typically take 2-3 business days were completed in seconds during the trial. The pilot involved partnerships with major commercial banks and fintech companies to test various use cases including cross-border payments and retail transactions. While still in early stages, the results suggest that a digital dollar could revolutionize the financial system. The next phase will focus on privacy features and interoperability with existing payment systems.",
    source: "Federal Reserve News",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["CBDC", "Federal Reserve", "Digital Dollar", "Banking"],
  },
  {
    id: 5,
    title: "NFT Market Shows Signs of Recovery with 40% Volume Increase",
    summary:
      "The NFT marketplace has experienced a 40% increase in trading volume over the past week, suggesting a potential recovery from the recent downturn.",
    content:
      "The Non-Fungible Token (NFT) market is showing signs of recovery after months of declining activity. Trading volume has increased by 40% over the past week, with several high-profile collections seeing renewed interest. The recovery is attributed to new utility-focused projects and improved market sentiment. Major marketplaces report increased user engagement and new wallet connections. Gaming NFTs and utility tokens are leading the recovery, while profile picture collections remain subdued. Industry experts believe this uptick could signal the beginning of a more sustainable NFT market focused on real-world applications rather than speculation. The total NFT market capitalization has risen to $8.2 billion, up from $6.1 billion last month.",
    source: "NFT Market Report",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.5,
    impact_score: 5,
    tags: ["NFT", "Recovery", "Trading Volume", "Gaming"],
  },
  {
    id: 6,
    title: "Regulatory Clarity Emerges as SEC Approves New Crypto Framework",
    summary:
      "The Securities and Exchange Commission has approved a comprehensive framework for cryptocurrency regulation, providing much-needed clarity for the industry.",
    content:
      "The Securities and Exchange Commission (SEC) has taken a significant step forward in cryptocurrency regulation by approving a comprehensive framework that provides clear guidelines for digital asset classification and compliance. The new framework establishes criteria for determining whether a cryptocurrency should be classified as a security, commodity, or utility token. This regulatory clarity is expected to encourage institutional investment and innovation in the crypto space. The framework also outlines requirements for crypto exchanges, custody services, and investment products. Industry leaders have praised the move as a positive step toward mainstream adoption. The announcement has led to a broad rally in cryptocurrency prices, with the total market cap increasing by 8% in the past 24 hours.",
    source: "Regulatory Update",
    url: "https://example.com/sec-framework",
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    sentiment_score: 0.7,
    impact_score: 9,
    tags: ["Regulation", "SEC", "Framework", "Compliance"],
  },
  {
    id: 7,
    title: "Layer 2 Solutions See Massive Growth as Ethereum Gas Fees Spike",
    summary:
      "Ethereum Layer 2 solutions have experienced unprecedented growth as users seek alternatives to high mainnet gas fees.",
    content:
      "Ethereum Layer 2 scaling solutions are experiencing explosive growth as mainnet gas fees reach new highs. Arbitrum, Optimism, and Polygon have all reported record-breaking transaction volumes and user adoption. The combined total value locked (TVL) across all Layer 2 networks has surpassed $15 billion, representing a 300% increase from six months ago. Users are migrating to these solutions to avoid gas fees that can exceed $100 for simple transactions during peak network congestion. DeFi protocols are also expanding to Layer 2 networks, with many offering additional incentives for users who bridge their assets. This trend is accelerating the multi-chain future of Ethereum and demonstrating the effectiveness of scaling solutions in addressing network limitations.",
    source: "Layer 2 Analytics",
    url: "https://example.com/layer2-growth",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    sentiment_score: 0.4,
    impact_score: 7,
    tags: ["Layer 2", "Ethereum", "Scaling", "Gas Fees"],
  },
  {
    id: 8,
    title: "Cryptocurrency Mining Industry Faces Environmental Scrutiny",
    summary:
      "Environmental groups are increasing pressure on cryptocurrency mining operations to adopt renewable energy sources and reduce carbon emissions.",
    content:
      "The cryptocurrency mining industry is facing increased scrutiny from environmental groups and regulators over its carbon footprint and energy consumption. Several major mining operations have announced commitments to achieve carbon neutrality by 2030, with some already transitioning to renewable energy sources. The Bitcoin Mining Council reports that sustainable energy usage in Bitcoin mining has increased to 58.4%, up from 36.8% in 2021. However, critics argue that this progress is insufficient given the urgency of climate change. Some jurisdictions are considering restrictions on energy-intensive mining operations, while others are promoting green mining initiatives. The industry is also exploring more energy-efficient consensus mechanisms and mining technologies to address these concerns.",
    source: "Environmental Crypto News",
    url: "https://example.com/mining-environment",
    published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    sentiment_score: -0.3,
    impact_score: 6,
    tags: ["Mining", "Environment", "Sustainability", "Energy"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "date"
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
        if (sentiment === "positive") return article.sentiment_score > 0.1
        if (sentiment === "negative") return article.sentiment_score < -0.1
        if (sentiment === "neutral") return article.sentiment_score >= -0.1 && article.sentiment_score <= 0.1
        return true
      })
    }

    // Apply sorting
    filteredNews.sort((a, b) => {
      let aValue: any, bValue: any

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
    console.error("News API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 })
  }
}
