import { type NextRequest, NextResponse } from "next/server"

// Mock news data
const mockNews = [
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
      "Ethereum staking rewards have dropped to their lowest levels since the merge, indicating network maturity but concerning some validators.",
    content:
      "Ethereum's proof-of-stake network is showing signs of maturation as staking rewards have declined to approximately 3.2% annually, the lowest since the successful merge in September 2022. This decrease is attributed to the growing number of validators joining the network, which now exceeds 900,000 active validators. While lower rewards might concern some stakers, network experts view this as a positive sign of Ethereum's stability and security. The network's total value locked in staking has surpassed 30 million ETH, worth over $75 billion at current prices. Despite lower yields, institutional interest in Ethereum staking continues to grow, with several major exchanges launching new staking services.",
    source: "Ethereum Insights",
    url: "https://example.com/eth-staking",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment_score: 0.2,
    impact_score: 6,
    tags: ["Ethereum", "Staking", "PoS", "Validators"],
  },
  {
    id: "3",
    title: "Major DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary:
      "A popular DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.",
    content:
      "The DeFi space has been rocked by another major exploit, with YieldFarm Protocol losing approximately $50 million to hackers who exploited a reentrancy vulnerability in the platform's lending smart contract. The attack occurred during a routine upgrade, where the hackers manipulated the protocol's price oracle to drain funds from multiple liquidity pools. The protocol team has paused all operations and is working with blockchain security firms to assess the damage. This incident highlights the ongoing security challenges in DeFi, where complex smart contracts can contain subtle vulnerabilities. The exploit has caused the protocol's native token to crash by 80%, and several other DeFi tokens have also declined on contagion fears. Users are advised to withdraw funds from similar protocols until security audits are completed.",
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
      "The Federal Reserve's CBDC pilot program has completed its first phase with positive feedback from participating financial institutions.",
    content:
      "The Federal Reserve has announced promising results from the first phase of its Central Bank Digital Currency (CBDC) pilot program. The six-month trial involved 12 major banks and credit unions, processing over 1 million test transactions with an average settlement time of 2.3 seconds. Participants reported significant improvements in cross-border payments and reduced operational costs. The digital dollar prototype demonstrated 99.9% uptime and successfully handled peak loads of 100,000 transactions per second. However, privacy advocates have raised concerns about the potential for increased government surveillance. The Fed plans to expand the pilot to include retail transactions in the second phase, scheduled to begin next quarter. This development could significantly impact the cryptocurrency landscape, as CBDCs offer some benefits of digital currencies while maintaining government backing.",
    source: "Federal Reserve News",
    url: "https://example.com/cbdc-pilot",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment_score: 0.4,
    impact_score: 7,
    tags: ["CBDC", "Federal Reserve", "Digital Dollar", "Banking"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery with Blue-Chip Collections Leading",
    summary:
      "The NFT market is experiencing a resurgence, with trading volumes up 40% this month and blue-chip collections seeing renewed interest.",
    content:
      "After months of declining activity, the NFT market is showing clear signs of recovery. Trading volumes across major marketplaces have increased by 40% this month, with blue-chip collections like CryptoPunks and Bored Ape Yacht Club leading the charge. The floor price of CryptoPunks has risen 25% in the past two weeks, while BAYC has seen a 30% increase. This recovery is attributed to several factors, including the integration of NFTs into gaming platforms, new utility features for existing collections, and renewed interest from institutional collectors. Several major brands have also announced new NFT initiatives, including a collaboration between Nike and a popular gaming platform. Market analysts suggest this could be the beginning of a more sustainable NFT ecosystem focused on utility rather than speculation.",
    source: "NFT Market Report",
    url: "https://example.com/nft-recovery",
    published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    sentiment_score: 0.6,
    impact_score: 5,
    tags: ["NFT", "CryptoPunks", "BAYC", "Recovery"],
  },
  {
    id: "6",
    title: "Regulatory Clarity Emerges as SEC Approves New Cryptocurrency Framework",
    summary:
      "The SEC has approved a comprehensive framework for cryptocurrency regulation, providing much-needed clarity for the industry.",
    content:
      "In a landmark decision, the Securities and Exchange Commission has approved a comprehensive regulatory framework for cryptocurrencies, ending years of uncertainty for the industry. The new framework establishes clear guidelines for token classification, exchange operations, and institutional custody services. Under the new rules, cryptocurrencies will be classified into three categories: currency tokens (like Bitcoin), utility tokens, and security tokens, each with specific compliance requirements. The framework also introduces a safe harbor provision for decentralized protocols, allowing them to operate without immediate regulatory action if they meet certain criteria. Industry leaders have praised the decision, with many exchanges already announcing plans to expand their US operations. The framework is expected to attract significant institutional investment and could pave the way for more cryptocurrency ETFs. Implementation will begin in six months, giving companies time to ensure compliance.",
    source: "Regulatory Update",
    url: "https://example.com/sec-framework",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment_score: 0.9,
    impact_score: 10,
    tags: ["SEC", "Regulation", "Framework", "Compliance"],
  },
  {
    id: "7",
    title: "Layer 2 Solutions See Massive Growth as Ethereum Gas Fees Remain High",
    summary:
      "Polygon, Arbitrum, and Optimism have seen combined TVL grow by 150% as users seek alternatives to high Ethereum mainnet fees.",
    content:
      "Layer 2 scaling solutions are experiencing unprecedented growth as Ethereum gas fees continue to remain elevated. Polygon, Arbitrum, and Optimism have collectively seen their Total Value Locked (TVL) increase by 150% over the past quarter, now holding over $15 billion in assets. This surge is driven by users and developers seeking cheaper alternatives to Ethereum's mainnet, where simple transactions can cost $20-50 during peak congestion. Arbitrum leads the pack with $6.2 billion in TVL, followed by Polygon at $5.1 billion and Optimism at $3.7 billion. The growth has been particularly strong in DeFi applications, with several major protocols launching Layer 2 versions of their platforms. New innovations like zero-knowledge rollups are also gaining traction, with zkSync and StarkNet preparing for their mainnet launches. This trend suggests a multi-chain future where Layer 2 solutions play a crucial role in Ethereum's scalability.",
    source: "Layer 2 Analytics",
    url: "https://example.com/layer2-growth",
    published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    sentiment_score: 0.7,
    impact_score: 7,
    tags: ["Layer 2", "Polygon", "Arbitrum", "Optimism", "Scaling"],
  },
  {
    id: "8",
    title: "Crypto Mining Industry Faces Pressure from Environmental Concerns",
    summary:
      "Bitcoin mining companies are under increasing pressure to adopt renewable energy sources as environmental scrutiny intensifies.",
    content:
      "The cryptocurrency mining industry is facing mounting pressure from environmental groups and regulators to reduce its carbon footprint. Several major mining companies have announced commitments to achieve carbon neutrality by 2030, with some already transitioning to 100% renewable energy sources. Marathon Digital Holdings, one of the largest Bitcoin miners, reported that 70% of its operations now run on renewable energy, up from 30% last year. The pressure has intensified following reports that Bitcoin mining consumes as much electricity as some small countries. In response, the industry is exploring innovative solutions, including partnerships with renewable energy providers and the development of more efficient mining hardware. Some companies are also participating in carbon offset programs and investing in green technology research. Despite these efforts, critics argue that the industry needs to do more, with some jurisdictions considering restrictions on energy-intensive mining operations.",
    source: "Environmental Crypto News",
    url: "https://example.com/mining-environment",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    sentiment_score: -0.3,
    impact_score: 6,
    tags: ["Mining", "Environment", "Renewable Energy", "Sustainability"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "date"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

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
    if (sentiment) {
      if (sentiment === "positive") {
        filteredNews = filteredNews.filter((article) => article.sentiment_score > 0.3)
      } else if (sentiment === "negative") {
        filteredNews = filteredNews.filter((article) => article.sentiment_score < -0.3)
      } else if (sentiment === "neutral") {
        filteredNews = filteredNews.filter(
          (article) => article.sentiment_score >= -0.3 && article.sentiment_score <= 0.3,
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
        data: mockNews.slice(0, 8), // Fallback to first 8 articles
      },
      { status: 500 },
    )
  }
}
