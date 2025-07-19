import { type NextRequest, NextResponse } from "next/server"

// Mock news data with realistic crypto content
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
    summary:
      "Bitcoin has broken through previous resistance levels, reaching a new all-time high of $73,000 as major institutions continue to add BTC to their balance sheets.",
    content:
      "Bitcoin has achieved a significant milestone today, breaking through the $73,000 barrier for the first time in its history. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing Bitcoin purchases. The rally has been fueled by growing acceptance of Bitcoin as a store of value and hedge against inflation. Market analysts suggest that the current bull run could continue as more institutional investors enter the space. The cryptocurrency has gained over 150% year-to-date, outperforming traditional assets like gold and the S&P 500.",
    author: "Sarah Chen",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Bitcoin+ATH",
    tags: ["Bitcoin", "Cryptocurrency", "Institutional", "ATH"],
    sentiment: "positive" as const,
    impactScore: 9,
    source: "CryptoDaily",
    category: "Market Analysis",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures",
    summary:
      "Ethereum staking rewards have dropped to their lowest levels since the merge, indicating network maturation and increased validator participation.",
    content:
      "Ethereum's proof-of-stake network is showing signs of maturation as staking rewards have declined to approximately 3.2% annually, the lowest since the successful merge in September 2022. This decrease is attributed to the growing number of validators securing the network, which now exceeds 900,000 active validators. While lower rewards might seem concerning, analysts view this as a positive sign of network decentralization and security. The reduction in rewards is also contributing to Ethereum's deflationary pressure, with more ETH being burned than issued in recent weeks.",
    author: "Michael Rodriguez",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
    tags: ["Ethereum", "Staking", "ETH2", "Validators"],
    sentiment: "neutral" as const,
    impactScore: 6,
    source: "BlockchainNews",
    category: "Technology",
  },
  {
    id: "3",
    title: "DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary:
      "A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.",
    content:
      "The DeFi space has been rocked by another major exploit, with a prominent lending protocol losing approximately $50 million to hackers. The attack exploited a reentrancy vulnerability in the protocol's smart contract, allowing the attacker to drain funds from multiple pools. This incident highlights the ongoing security challenges facing the DeFi ecosystem, despite multiple audits of the affected protocol. The team has paused all protocol operations and is working with security firms to assess the damage. Users are advised to withdraw their funds from similar protocols as a precautionary measure.",
    author: "Alex Thompson",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=DeFi+Exploit",
    tags: ["DeFi", "Security", "Exploit", "Smart Contracts"],
    sentiment: "negative" as const,
    impactScore: 8,
    source: "DeFiWatch",
    category: "Security",
  },
  {
    id: "4",
    title: "Central Bank Digital Currencies Gain Momentum with New Pilot Programs",
    summary:
      "Several central banks have announced new CBDC pilot programs, signaling accelerated adoption of digital currencies by governments worldwide.",
    content:
      "The race for central bank digital currencies (CBDCs) is heating up as five major economies have announced new pilot programs this week. The European Central Bank, Bank of Japan, and Reserve Bank of Australia are among those launching comprehensive testing phases for their digital currencies. These initiatives aim to modernize payment systems, improve financial inclusion, and maintain monetary sovereignty in an increasingly digital economy. The pilots will test various aspects including privacy, scalability, and interoperability with existing financial infrastructure. Industry experts predict that at least 10 major CBDCs will be operational by 2025.",
    author: "Emma Watson",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=CBDC+Pilots",
    tags: ["CBDC", "Central Banks", "Digital Currency", "Government"],
    sentiment: "positive" as const,
    impactScore: 7,
    source: "FinTechToday",
    category: "Regulation",
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery with Blue-Chip Collections Leading",
    summary:
      "The NFT market is experiencing a resurgence with blue-chip collections seeing increased trading volume and floor prices rising across major marketplaces.",
    content:
      "After months of declining activity, the NFT market is showing promising signs of recovery. Blue-chip collections like CryptoPunks, Bored Ape Yacht Club, and Art Blocks have seen significant increases in trading volume over the past week. Floor prices for these premium collections have risen by 15-30%, indicating renewed investor confidence. The recovery is attributed to improved market sentiment, new utility announcements from major projects, and the integration of NFTs into gaming and metaverse platforms. OpenSea and Blur have reported their highest weekly volumes in six months.",
    author: "David Kim",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=NFT+Recovery",
    tags: ["NFT", "Digital Art", "Collectibles", "Marketplace"],
    sentiment: "positive" as const,
    impactScore: 5,
    source: "NFTInsider",
    category: "NFTs",
  },
  {
    id: "6",
    title: "Layer 2 Solutions See Explosive Growth as Ethereum Gas Fees Remain High",
    summary:
      "Ethereum Layer 2 networks have processed record transaction volumes as users seek alternatives to high mainnet gas fees.",
    content:
      "Ethereum's Layer 2 ecosystem is experiencing unprecedented growth, with networks like Arbitrum, Optimism, and Polygon processing record transaction volumes. The surge in L2 adoption comes as Ethereum mainnet gas fees remain elevated due to increased network activity. Arbitrum alone has processed over 2 million transactions in a single day, while Optimism has seen a 400% increase in daily active users over the past month. This growth is driving innovation in the L2 space, with new solutions focusing on improved user experience and lower costs. The success of L2s is crucial for Ethereum's scalability roadmap.",
    author: "Lisa Park",
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Layer+2+Growth",
    tags: ["Layer 2", "Ethereum", "Scaling", "Gas Fees"],
    sentiment: "positive" as const,
    impactScore: 6,
    source: "L2Beat",
    category: "Technology",
  },
  {
    id: "7",
    title: "Regulatory Clarity Emerges as SEC Provides New Guidance on Crypto Assets",
    summary:
      "The SEC has released comprehensive guidance on cryptocurrency classification, providing much-needed clarity for the industry.",
    content:
      "The Securities and Exchange Commission has published new guidance clarifying how it will classify various cryptocurrency assets, marking a significant step toward regulatory clarity in the United States. The guidance establishes clear criteria for determining whether a digital asset constitutes a security, focusing on factors such as decentralization, utility, and investor expectations. This development has been welcomed by industry participants who have long sought clearer regulatory frameworks. The guidance is expected to facilitate institutional adoption and encourage innovation while maintaining investor protection. Legal experts suggest this could pave the way for more crypto ETF approvals.",
    author: "Robert Johnson",
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=SEC+Guidance",
    tags: ["Regulation", "SEC", "Compliance", "Legal"],
    sentiment: "positive" as const,
    impactScore: 8,
    source: "RegulatoryNews",
    category: "Regulation",
  },
  {
    id: "8",
    title: "Web3 Gaming Sector Attracts $2B in Venture Capital Funding This Quarter",
    summary:
      "The Web3 gaming sector has secured record venture capital funding, with investors betting on the future of blockchain-based gaming experiences.",
    content:
      "The Web3 gaming sector has reached a new milestone with $2 billion in venture capital funding secured in the current quarter, representing a 150% increase from the previous quarter. Major gaming studios and blockchain startups are attracting significant investment as they develop play-to-earn games, NFT-based gaming assets, and decentralized gaming platforms. Notable funding rounds include a $200 million Series B for a metaverse gaming platform and a $150 million investment in a blockchain gaming infrastructure company. Investors are particularly interested in games that combine traditional gaming mechanics with blockchain technology to create sustainable economic models.",
    author: "Jennifer Lee",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Web3+Gaming",
    tags: ["Web3", "Gaming", "Venture Capital", "Investment"],
    sentiment: "positive" as const,
    impactScore: 7,
    source: "GameFi Daily",
    category: "Gaming",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sentiment = searchParams.get("sentiment") || ""
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
    filteredNews.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "impact":
          return b.impactScore - a.impactScore
        case "sentiment":
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 }
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment]
        default:
          return 0
      }
    })

    // Apply pagination
    const paginatedNews = filteredNews.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedNews,
      total: filteredNews.length,
      hasMore: offset + limit < filteredNews.length,
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 })
  }
}
