import { type NextRequest, NextResponse } from "next/server"

// Mock news data with realistic crypto content
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $75,000",
    summary: "Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.",
    content:
      "Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency's journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence. Technical analysis suggests strong momentum with key resistance levels being broken decisively.",
    author: "Sarah Chen",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Bitcoin+Chart",
    tags: ["Bitcoin", "ATH", "Institutional", "Price"],
    sentiment: "positive" as const,
    impactScore: 9,
    source: "CryptoDaily",
    category: "Market Analysis",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Participation",
    summary: "Over 32 million ETH now staked as validators rush to secure the network and earn rewards.",
    content:
      "Ethereum's proof-of-stake network has reached a new milestone with over 32 million ETH now staked by validators. This represents approximately 26% of the total ETH supply, demonstrating strong confidence in the network's future. The high participation rate has led to more stable staking rewards and enhanced network security. Recent protocol upgrades have made staking more accessible to retail investors through liquid staking solutions.",
    author: "Michael Rodriguez",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
    tags: ["Ethereum", "Staking", "ETH2", "Validators"],
    sentiment: "positive" as const,
    impactScore: 7,
    source: "BlockchainNews",
    category: "Technology",
  },
  {
    id: "3",
    title: "DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary: "A major DeFi lending protocol lost $50 million in a sophisticated flash loan attack.",
    content:
      "A prominent DeFi lending protocol has fallen victim to a sophisticated exploit that drained approximately $50 million from its treasury. The attack utilized a complex flash loan mechanism to manipulate price oracles and extract funds. Security researchers have identified the vulnerability in the protocol's smart contract code, which has since been patched. This incident highlights the ongoing security challenges facing the DeFi ecosystem and the importance of thorough code audits.",
    author: "Alex Thompson",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=DeFi+Security",
    tags: ["DeFi", "Security", "Exploit", "Flash Loan"],
    sentiment: "negative" as const,
    impactScore: 8,
    source: "DeFiWatch",
    category: "Security",
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilot Program Launches in Major Economy",
    summary: "A G7 nation begins testing its digital currency with select financial institutions.",
    content:
      "A major G7 economy has officially launched its Central Bank Digital Currency (CBDC) pilot program, marking a significant step toward mainstream digital currency adoption. The program involves collaboration with major banks and fintech companies to test real-world use cases. Initial focus areas include cross-border payments, retail transactions, and interoperability with existing payment systems. The pilot is expected to run for 12 months before potential wider rollout.",
    author: "Emma Wilson",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=CBDC+Launch",
    tags: ["CBDC", "Central Bank", "Digital Currency", "Pilot"],
    sentiment: "neutral" as const,
    impactScore: 6,
    source: "FinanceToday",
    category: "Regulation",
  },
  {
    id: "5",
    title: "NFT Marketplace Introduces Zero-Fee Trading to Compete with OpenSea",
    summary: "A rising NFT platform eliminates trading fees to attract creators and collectors.",
    content:
      "A prominent NFT marketplace has announced the elimination of all trading fees in a bold move to compete with established platforms like OpenSea. The platform will instead generate revenue through premium services and partnerships. This decision comes as NFT trading volumes have declined from their 2021 peaks, forcing platforms to innovate to attract users. The move has been welcomed by creators who previously paid significant fees on transactions.",
    author: "David Park",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=NFT+Marketplace",
    tags: ["NFT", "Marketplace", "Zero Fees", "Competition"],
    sentiment: "positive" as const,
    impactScore: 5,
    source: "NFTInsider",
    category: "NFTs",
  },
  {
    id: "6",
    title: "Regulatory Uncertainty Causes Crypto Exchange to Exit Major Market",
    summary: "Unclear regulations force a top-10 exchange to cease operations in a key jurisdiction.",
    content:
      "A major cryptocurrency exchange has announced its withdrawal from a significant market due to regulatory uncertainty and compliance challenges. The exchange cited unclear guidelines and potential legal risks as primary factors in the decision. This move affects millions of users who must transfer their assets to other platforms or international services. The development highlights the ongoing regulatory challenges facing the cryptocurrency industry globally.",
    author: "Lisa Chang",
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Exchange+Exit",
    tags: ["Regulation", "Exchange", "Compliance", "Market Exit"],
    sentiment: "negative" as const,
    impactScore: 7,
    source: "CryptoRegulatory",
    category: "Regulation",
  },
  {
    id: "7",
    title: "Layer 2 Scaling Solution Processes 1 Million Transactions in Single Day",
    summary: "Ethereum Layer 2 network achieves new throughput milestone with minimal fees.",
    content:
      "An Ethereum Layer 2 scaling solution has achieved a significant milestone by processing over 1 million transactions in a single day while maintaining average fees below $0.01. This achievement demonstrates the potential of Layer 2 technologies to address Ethereum's scalability challenges. The network has seen increased adoption from DeFi protocols and NFT platforms seeking lower transaction costs. Developer activity on the platform has increased by 300% over the past quarter.",
    author: "Ryan Kumar",
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Layer+2+Scaling",
    tags: ["Layer 2", "Scaling", "Ethereum", "Transactions"],
    sentiment: "positive" as const,
    impactScore: 6,
    source: "TechCrypto",
    category: "Technology",
  },
  {
    id: "8",
    title: "Institutional Crypto Custody Platform Secures $100M Series B Funding",
    summary: "Growing institutional demand drives major investment in crypto infrastructure.",
    content:
      "A leading institutional cryptocurrency custody platform has secured $100 million in Series B funding, reflecting growing institutional interest in digital assets. The funding round was led by prominent venture capital firms and will be used to expand global operations and enhance security infrastructure. The platform currently holds over $10 billion in digital assets for institutional clients including pension funds, hedge funds, and family offices. This investment signals continued institutional adoption despite market volatility.",
    author: "Jennifer Martinez",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    imageUrl: "/placeholder.svg?height=200&width=400&text=Custody+Funding",
    tags: ["Institutional", "Custody", "Funding", "Infrastructure"],
    sentiment: "positive" as const,
    impactScore: 5,
    source: "InvestmentNews",
    category: "Business",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const sentiment = searchParams.get("sentiment")
    const sortBy = searchParams.get("sortBy") || "date"
    const category = searchParams.get("category")

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
        filteredNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
      case "sentiment":
        filteredNews.sort((a, b) => {
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 }
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment]
        })
        break
      case "impact":
        filteredNews.sort((a, b) => b.impactScore - a.impactScore)
        break
    }

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
      },
      { status: 500 },
    )
  }
}
