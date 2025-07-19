import { type NextRequest, NextResponse } from "next/server"

// Mock news data with realistic crypto content
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
    summary:
      "Bitcoin has broken through previous resistance levels, reaching a new all-time high of $73,000 as major institutions continue to add BTC to their balance sheets.",
    content:
      "Bitcoin's remarkable surge to new heights has been driven by unprecedented institutional adoption. Major corporations including MicroStrategy, Tesla, and Square have allocated significant portions of their treasury reserves to Bitcoin. The cryptocurrency's limited supply of 21 million coins, combined with growing demand from institutional investors, has created a perfect storm for price appreciation. Market analysts predict this trend will continue as more Fortune 500 companies recognize Bitcoin as a legitimate store of value and hedge against inflation.",
    source: "CryptoDaily",
    author: "Sarah Johnson",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    url: "https://cryptodaily.com/bitcoin-ath-institutional-adoption",
    image_url: "/placeholder.svg?height=200&width=400&text=Bitcoin+Chart",
    category: "Market Analysis",
    tags: ["Bitcoin", "BTC", "Institutional", "ATH", "Investment"],
    sentiment: "positive" as const,
    impact_score: 9,
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    summary:
      "Ethereum validators are earning unprecedented rewards as network activity surges and staking participation reaches new milestones.",
    content:
      "The Ethereum network has seen a dramatic increase in staking rewards, with validators now earning an average of 8.5% APY. This surge is attributed to increased network activity, higher transaction fees, and the successful implementation of EIP-1559. The proof-of-stake consensus mechanism has proven to be both energy-efficient and profitable for participants. With over 18 million ETH now staked, representing approximately 15% of the total supply, the network's security and decentralization continue to strengthen.",
    source: "EthereumInsider",
    author: "Michael Chen",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    url: "https://ethereuminsider.com/eth2-staking-rewards-record",
    image_url: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
    category: "DeFi",
    tags: ["Ethereum", "ETH", "Staking", "Rewards", "PoS"],
    sentiment: "positive" as const,
    impact_score: 7,
  },
  {
    id: "3",
    title: "Major DeFi Protocol Suffers $50M Exploit",
    summary:
      "A popular decentralized finance protocol has been exploited for $50 million due to a smart contract vulnerability.",
    content:
      "The DeFi space has been shaken by another major exploit, with hackers draining $50 million from a prominent lending protocol. The attack exploited a vulnerability in the protocol's flash loan mechanism, allowing the attacker to manipulate price oracles and drain funds. This incident highlights the ongoing security challenges in the DeFi ecosystem, where complex smart contracts can contain subtle vulnerabilities. The protocol team has paused all operations and is working with security firms to investigate the breach and potentially recover funds.",
    source: "DeFiWatch",
    author: "Alex Rodriguez",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    url: "https://defiwatch.com/major-protocol-exploit-50m",
    image_url: "/placeholder.svg?height=200&width=400&text=DeFi+Security",
    category: "Security",
    tags: ["DeFi", "Exploit", "Security", "Smart Contracts", "Hack"],
    sentiment: "negative" as const,
    impact_score: 8,
  },
  {
    id: "4",
    title: "Central Bank Digital Currencies Gain Momentum Globally",
    summary:
      "Multiple countries announce progress on their CBDC initiatives, with pilot programs showing promising results.",
    content:
      "Central Bank Digital Currencies (CBDCs) are gaining significant traction worldwide, with over 100 countries now exploring or developing their own digital currencies. China's digital yuan has completed successful pilot programs in major cities, while the European Central Bank has advanced its digital euro project. The Bank of England and Federal Reserve are also conducting extensive research into CBDCs. These developments could reshape the global financial system, offering benefits such as improved payment efficiency, financial inclusion, and monetary policy transmission.",
    source: "GlobalFinance",
    author: "Emma Thompson",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    url: "https://globalfinance.com/cbdc-momentum-global",
    image_url: "/placeholder.svg?height=200&width=400&text=CBDC+Global",
    category: "Regulation",
    tags: ["CBDC", "Central Bank", "Digital Currency", "Regulation", "Government"],
    sentiment: "neutral" as const,
    impact_score: 6,
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery After Prolonged Downturn",
    summary: "Non-fungible token sales volume increases 40% this month as new utility-focused projects gain traction.",
    content:
      "The NFT market is showing signs of recovery after months of declining activity. Trading volume has increased by 40% this month, driven by new projects that focus on utility rather than speculation. Gaming NFTs, music rights tokens, and real-world asset tokenization are leading the recovery. Major brands are also re-entering the space with more thoughtful approaches, focusing on community building and long-term value creation rather than quick cash grabs. This shift towards utility-based NFTs suggests a maturing market.",
    source: "NFTTrends",
    author: "David Kim",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    url: "https://nfttrends.com/nft-market-recovery-signs",
    image_url: "/placeholder.svg?height=200&width=400&text=NFT+Recovery",
    category: "NFTs",
    tags: ["NFT", "Recovery", "Utility", "Gaming", "Brands"],
    sentiment: "positive" as const,
    impact_score: 5,
  },
  {
    id: "6",
    title: "Layer 2 Solutions See Explosive Growth in Transaction Volume",
    summary:
      "Ethereum Layer 2 networks process record-breaking transaction volumes as users seek lower fees and faster confirmations.",
    content:
      "Layer 2 scaling solutions for Ethereum have experienced explosive growth, with combined transaction volumes reaching new all-time highs. Arbitrum, Optimism, and Polygon have seen their daily transaction counts increase by over 300% in the past quarter. This growth is driven by users seeking alternatives to Ethereum's high gas fees and slower confirmation times. DeFi protocols, NFT marketplaces, and gaming applications are increasingly deploying on Layer 2 networks, creating a thriving ecosystem that maintains Ethereum's security while offering improved user experience.",
    source: "Layer2News",
    author: "Jennifer Walsh",
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    url: "https://layer2news.com/l2-explosive-growth-volume",
    image_url: "/placeholder.svg?height=200&width=400&text=Layer+2+Growth",
    category: "Technology",
    tags: ["Layer 2", "Scaling", "Arbitrum", "Optimism", "Polygon"],
    sentiment: "positive" as const,
    impact_score: 7,
  },
  {
    id: "7",
    title: "Regulatory Clarity Emerges as SEC Provides New Crypto Guidelines",
    summary:
      "The Securities and Exchange Commission releases comprehensive guidelines for cryptocurrency classification and compliance.",
    content:
      "The SEC has released new comprehensive guidelines that provide much-needed clarity for the cryptocurrency industry. The guidelines establish clear criteria for determining whether a digital asset should be classified as a security, commodity, or utility token. This regulatory clarity is expected to boost institutional adoption and reduce compliance uncertainty for crypto businesses. The guidelines also outline registration requirements for crypto exchanges and provide safe harbor provisions for certain types of tokens. Industry leaders have welcomed these developments as a positive step toward mainstream adoption.",
    source: "RegulatoryUpdate",
    author: "Robert Martinez",
    published_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    url: "https://regulatoryupdate.com/sec-crypto-guidelines-clarity",
    image_url: "/placeholder.svg?height=200&width=400&text=SEC+Guidelines",
    category: "Regulation",
    tags: ["SEC", "Regulation", "Guidelines", "Compliance", "Legal"],
    sentiment: "positive" as const,
    impact_score: 8,
  },
  {
    id: "8",
    title: "Crypto Mining Industry Shifts Toward Renewable Energy",
    summary:
      "Major mining operations announce commitments to 100% renewable energy as environmental concerns drive industry transformation.",
    content:
      "The cryptocurrency mining industry is undergoing a significant transformation as major operations commit to using 100% renewable energy. Leading mining companies have announced partnerships with solar and wind energy providers, with some operations already achieving carbon neutrality. This shift is driven by both environmental concerns and economic incentives, as renewable energy costs continue to decline. The Bitcoin Mining Council reports that over 58% of the network now uses sustainable energy sources, up from 36% last year. This trend is expected to accelerate as ESG considerations become increasingly important for institutional investors.",
    source: "GreenCrypto",
    author: "Lisa Anderson",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    url: "https://greencrypto.com/mining-renewable-energy-shift",
    image_url: "/placeholder.svg?height=200&width=400&text=Green+Mining",
    category: "Environment",
    tags: ["Mining", "Renewable Energy", "Sustainability", "ESG", "Environment"],
    sentiment: "positive" as const,
    impact_score: 6,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const sentiment = searchParams.get("sentiment")
    const category = searchParams.get("category")
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

    // Apply category filter
    if (category && category !== "all") {
      filteredNews = filteredNews.filter((article) => article.category === category)
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filteredNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        break
      case "impact":
        filteredNews.sort((a, b) => b.impact_score - a.impact_score)
        break
      case "sentiment":
        filteredNews.sort((a, b) => {
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 }
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment]
        })
        break
    }

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
