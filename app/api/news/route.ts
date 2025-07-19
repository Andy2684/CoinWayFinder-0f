import { type NextRequest, NextResponse } from "next/server"

// Mock news data
const MOCK_NEWS = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
    summary:
      "Bitcoin has broken through previous resistance levels, reaching a new all-time high of $75,000 as major institutions continue to add BTC to their balance sheets.",
    content:
      "Bitcoin has achieved a significant milestone today, breaking through the $75,000 barrier for the first time in its history. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing Bitcoin purchases. The cryptocurrency has gained over 15% in the past week alone, driven by positive regulatory developments and growing mainstream acceptance. Market analysts suggest this could be the beginning of a new bull cycle, with some predicting Bitcoin could reach $100,000 by the end of the year. The surge has also lifted other cryptocurrencies, with Ethereum gaining 8% and many altcoins seeing double-digit increases.",
    source: "CryptoNews Daily",
    url: "https://example.com/bitcoin-ath",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment_score: 0.8,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional", "Bullish"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures",
    summary:
      "Ethereum staking rewards have dropped to their lowest levels since the merge, indicating network maturity and increased validator participation.",
    content:
      "Ethereum's proof-of-stake network is showing signs of maturity as staking rewards have declined to approximately 3.2% annually, the lowest since the successful merge in September 2022. This decrease is attributed to the growing number of validators securing the network, now exceeding 900,000 active validators. While lower rewards might seem concerning, analysts view this as a positive sign of network decentralization and security. The Ethereum Foundation reports that over 29 million ETH is now staked, representing about 24% of the total supply. Despite lower yields, institutional interest in Ethereum staking continues to grow, with several major exchanges launching new staking products.",
    source: "Ethereum Insights",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.2,
    impact_score: 6,
    tags: ["Ethereum", "Staking", "PoS", "Network"],
  },
  {
    id: "3",
    title: "DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary:
      "A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.",
    content:
      "The DeFi space has been rocked by another major exploit, with a prominent lending protocol losing approximately $50 million to hackers. The attack exploited a reentrancy vulnerability in the protocol's smart contract, allowing the attacker to drain funds from multiple liquidity pools. The protocol team has acknowledged the exploit and is working with security firms and law enforcement to track the stolen funds. This incident highlights the ongoing security challenges in DeFi, where complex smart contracts can contain subtle vulnerabilities. The protocol has paused all operations and is conducting a thorough security audit. Users are advised to withdraw their funds once operations resume. The exploit has sent shockwaves through the DeFi community, with several other protocols conducting emergency security reviews.",
    source: "DeFi Security Watch",
    url: "https://example.com/defi-exploit",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment_score: -0.9,
    impact_score: 8,
    tags: ["DeFi", "Exploit", "Security", "Smart Contract"],
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilot Program Shows Promising Results",
    summary:
      "The Federal Reserve's CBDC pilot program has completed its first phase, showing improved transaction efficiency and reduced settlement times.",
    content:
      "The Federal Reserve has released preliminary results from its Central Bank Digital Currency (CBDC) pilot program, showing significant improvements in transaction processing and settlement times. The six-month pilot, conducted in partnership with major financial institutions, processed over 1 million test transactions with an average settlement time of under 10 seconds. The digital dollar prototype demonstrated 99.9% uptime and successfully handled peak loads equivalent to Black Friday shopping volumes. Privacy features built into the system ensure transaction anonymity while maintaining compliance with anti-money laundering regulations. The Fed plans to expand the pilot program to include more participants and test cross-border transactions. However, concerns remain about the impact on commercial banks and the broader financial system.",
    source: "Federal Reserve News",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.6,
    impact_score: 7,
    tags: ["CBDC", "Federal Reserve", "Digital Dollar", "Pilot"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery with 40% Volume Increase",
    summary:
      "The NFT marketplace has experienced a 40% increase in trading volume over the past month, suggesting a potential recovery from the prolonged bear market.",
    content:
      "The non-fungible token (NFT) market is showing signs of life after months of declining activity, with trading volumes increasing by 40% over the past month. This resurgence is attributed to the launch of several high-profile collections and renewed interest from collectors. OpenSea, the largest NFT marketplace, reported its highest daily volume in six months, with over $15 million in transactions. The recovery is being driven by utility-focused NFTs and gaming assets, rather than the speculative profile picture projects that dominated the 2021 boom. Several major brands have also re-entered the space, launching NFT collections tied to real-world benefits and experiences. While volumes remain well below peak levels, the sustained growth suggests the market may be finding its footing.",
    source: "NFT Market Report",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    sentiment_score: 0.5,
    impact_score: 5,
    tags: ["NFT", "Recovery", "OpenSea", "Trading Volume"],
  },
  {
    id: "6",
    title: "Regulatory Clarity Boosts Crypto Adoption Among Traditional Banks",
    summary:
      "New regulatory guidelines have provided the clarity banks needed to offer cryptocurrency services, leading to a surge in institutional adoption.",
    content:
      "The release of comprehensive cryptocurrency regulations has provided the clarity that traditional financial institutions have been seeking, resulting in a wave of new crypto service offerings. Major banks are now launching custody services, trading desks, and investment products for digital assets. The regulations establish clear guidelines for anti-money laundering compliance, customer protection, and capital requirements for crypto operations. JPMorgan Chase announced it will offer Bitcoin and Ethereum trading to institutional clients, while Bank of America is developing a cryptocurrency custody solution. The regulatory framework has also attracted new institutional investors, with pension funds and insurance companies beginning to allocate portions of their portfolios to digital assets. Industry experts predict this regulatory clarity will accelerate mainstream adoption and bring billions in new capital to the crypto market.",
    source: "Banking & Finance Today",
    url: "https://example.com/regulatory-clarity",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.7,
    impact_score: 8,
    tags: ["Regulation", "Banks", "Institutional", "Compliance"],
  },
  {
    id: "7",
    title: "Layer 2 Solutions See Massive Growth as Ethereum Fees Remain High",
    summary:
      "Ethereum Layer 2 networks have processed over $10 billion in transactions this month as users seek alternatives to high mainnet fees.",
    content:
      "Ethereum Layer 2 scaling solutions are experiencing unprecedented growth, with combined transaction volumes exceeding $10 billion this month. Arbitrum and Optimism lead the pack, processing millions of transactions daily at a fraction of mainnet costs. The surge in L2 adoption is driven by persistently high Ethereum gas fees, which have averaged over $20 per transaction during peak periods. Polygon has also seen significant growth, with several major DeFi protocols migrating to its network. The Layer 2 ecosystem now hosts over 200 decentralized applications, ranging from DeFi protocols to NFT marketplaces. Despite this growth, concerns remain about the fragmentation of liquidity across multiple networks and the complexity of bridging assets between layers. Ethereum's upcoming upgrades aim to address these scalability issues, but Layer 2 solutions are likely to remain crucial for the network's long-term success.",
    source: "Layer 2 Analytics",
    url: "https://example.com/layer2-growth",
    published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    sentiment_score: 0.4,
    impact_score: 6,
    tags: ["Layer 2", "Ethereum", "Scaling", "Gas Fees"],
  },
  {
    id: "8",
    title: "Crypto Mining Industry Faces Pressure from Environmental Concerns",
    summary:
      "Environmental groups are increasing pressure on cryptocurrency miners to adopt renewable energy sources as climate concerns mount.",
    content:
      "The cryptocurrency mining industry is facing mounting pressure from environmental groups and regulators to reduce its carbon footprint and transition to renewable energy sources. A new report estimates that Bitcoin mining alone consumes as much electricity as a medium-sized country, raising concerns about its environmental impact. Several mining companies have announced commitments to achieve carbon neutrality by 2030, with some already operating entirely on renewable energy. The Sustainable Bitcoin Mining Council reports that 58% of the Bitcoin network now uses sustainable energy sources, up from 36% last year. However, critics argue that this progress is insufficient given the urgency of climate change. Some jurisdictions are considering restrictions on energy-intensive mining operations, while others are offering incentives for miners who use renewable energy. The industry is also exploring more energy-efficient consensus mechanisms and mining technologies to address these concerns.",
    source: "Environmental Crypto News",
    url: "https://example.com/mining-environment",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    sentiment_score: -0.3,
    impact_score: 7,
    tags: ["Mining", "Environment", "Sustainability", "Energy"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "date"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let filteredNews = [...MOCK_NEWS]

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
      if (sentiment === "positive") {
        filteredNews = filteredNews.filter((article) => article.sentiment_score > 0.1)
      } else if (sentiment === "negative") {
        filteredNews = filteredNews.filter((article) => article.sentiment_score < -0.1)
      } else if (sentiment === "neutral") {
        filteredNews = filteredNews.filter(
          (article) => article.sentiment_score >= -0.1 && article.sentiment_score <= 0.1,
        )
      }
    }

    // Apply sorting
    if (sortBy === "sentiment") {
      filteredNews.sort((a, b) => b.sentiment_score - a.sentiment_score)
    } else if (sortBy === "impact") {
      filteredNews.sort((a, b) => b.impact_score - a.impact_score)
    } else {
      // Default sort by date (newest first)
      filteredNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    }

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
        data: MOCK_NEWS.slice(0, 8), // Return mock data as fallback
      },
      { status: 500 },
    )
  }
}
