import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Mock news data with realistic crypto articles
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Surges Past $45,000 as Institutional Adoption Accelerates",
    summary:
      "Major corporations continue to add Bitcoin to their treasury reserves, driving unprecedented institutional demand.",
    content:
      "Bitcoin has broken through the $45,000 resistance level as institutional adoption continues to accelerate. Major corporations including MicroStrategy, Tesla, and Square have added significant amounts of Bitcoin to their treasury reserves. This institutional demand, combined with growing retail interest, has created a perfect storm for Bitcoin's latest rally. Analysts predict that if the current trend continues, Bitcoin could reach new all-time highs within the next quarter.",
    source: "CryptoNews Daily",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sentiment: "positive" as const,
    impact: 9,
    tags: ["Bitcoin", "Institutional", "Adoption", "Price"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=Bitcoin+Chart",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record High Amid Network Upgrades",
    summary: "Ethereum staking yields reach 8.5% APY as network improvements drive increased validator participation.",
    content:
      "Ethereum 2.0 staking rewards have reached a record high of 8.5% APY, attracting more validators to secure the network. The recent network upgrades have improved transaction throughput and reduced gas fees, making Ethereum more attractive to both developers and users. With over 32 million ETH now staked, representing nearly 27% of the total supply, the network security has never been stronger.",
    source: "DeFi Analytics",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    sentiment: "positive" as const,
    impact: 8,
    tags: ["Ethereum", "Staking", "DeFi", "Yield"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
  },
  {
    id: "3",
    title: "SEC Delays Decision on Spot Bitcoin ETF Applications Again",
    summary:
      "Regulatory uncertainty continues as the SEC postpones approval decisions for multiple Bitcoin ETF proposals.",
    content:
      "The Securities and Exchange Commission has once again delayed its decision on several spot Bitcoin ETF applications, citing the need for additional review time. This marks the third delay for some applications, creating continued uncertainty in the market. Despite the delays, industry experts remain optimistic that approval will eventually come, potentially opening the floodgates for institutional investment.",
    source: "Regulatory Watch",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sentiment: "negative" as const,
    impact: 7,
    tags: ["SEC", "ETF", "Regulation", "Bitcoin"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=SEC+Building",
  },
  {
    id: "4",
    title: "DeFi Protocol Launches Revolutionary Cross-Chain Bridge",
    summary:
      "New interoperability solution promises to connect major blockchains with unprecedented security and speed.",
    content:
      "A groundbreaking DeFi protocol has launched a revolutionary cross-chain bridge that connects Ethereum, Binance Smart Chain, Polygon, and Avalanche with unprecedented security measures. The bridge uses advanced cryptographic proofs and multi-signature validation to ensure secure asset transfers across chains. Early testing shows transaction times of under 30 seconds with fees 90% lower than existing solutions.",
    source: "DeFi Innovation Hub",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    sentiment: "positive" as const,
    impact: 6,
    tags: ["DeFi", "Cross-chain", "Innovation", "Interoperability"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=Cross+Chain+Bridge",
  },
  {
    id: "5",
    title: "Major Exchange Suffers Security Breach, $50M in Crypto Stolen",
    summary: "Hackers exploit smart contract vulnerability to drain funds from popular decentralized exchange.",
    content:
      "A major decentralized exchange has suffered a significant security breach, with hackers stealing approximately $50 million in various cryptocurrencies. The attack exploited a previously unknown vulnerability in the exchange's smart contract code. The exchange has immediately halted all trading and is working with security firms to investigate the breach. Users are advised to withdraw their funds as soon as trading resumes.",
    source: "Crypto Security Alert",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    sentiment: "negative" as const,
    impact: 8,
    tags: ["Security", "Hack", "DEX", "Smart Contract"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=Security+Breach",
  },
  {
    id: "6",
    title: "Central Bank Digital Currency Pilot Program Shows Promising Results",
    summary:
      "Government-backed digital currency trial demonstrates improved transaction efficiency and financial inclusion.",
    content:
      "A major central bank has released positive results from its digital currency pilot program, showing significant improvements in transaction efficiency and financial inclusion. The CBDC processed over 1 million transactions during the 6-month trial with 99.9% uptime and average settlement times of 2 seconds. The success of the pilot has led to plans for a nationwide rollout within the next 18 months.",
    source: "Central Banking Today",
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    sentiment: "neutral" as const,
    impact: 7,
    tags: ["CBDC", "Government", "Digital Currency", "Pilot"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=Digital+Currency",
  },
  {
    id: "7",
    title: "NFT Marketplace Introduces Carbon-Neutral Minting Process",
    summary: "Leading NFT platform partners with renewable energy providers to offset environmental impact.",
    content:
      "A leading NFT marketplace has announced a groundbreaking carbon-neutral minting process, partnering with renewable energy providers to offset the environmental impact of NFT creation. The platform will purchase carbon credits equivalent to the energy consumption of each NFT minted, making it the first major marketplace to achieve true carbon neutrality. This move comes as environmental concerns about blockchain technology continue to grow.",
    source: "Green Crypto News",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    sentiment: "positive" as const,
    impact: 5,
    tags: ["NFT", "Environment", "Carbon Neutral", "Sustainability"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=Green+NFT",
  },
  {
    id: "8",
    title: "Crypto Lending Platform Offers 12% APY on Stablecoin Deposits",
    summary: "New DeFi protocol attracts billions in TVL with competitive yield farming opportunities.",
    content:
      "A new DeFi lending platform has launched with attractive 12% APY rates on stablecoin deposits, quickly attracting over $2 billion in total value locked (TVL). The platform uses innovative yield farming strategies and automated market making to generate returns for depositors. Security audits by leading firms have given the protocol high marks for safety and transparency.",
    source: "Yield Farming Weekly",
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    sentiment: "positive" as const,
    impact: 6,
    tags: ["DeFi", "Lending", "Yield Farming", "Stablecoin"],
    imageUrl: "/placeholder.svg?height=200&width=400&text=DeFi+Lending",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sentiment = searchParams.get("sentiment") || ""
    const sortBy = searchParams.get("sortBy") || "date"
    const page = Number.parseInt(searchParams.get("page") || "1")
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
    if (sentiment && sentiment !== "all") {
      filteredNews = filteredNews.filter((article) => article.sentiment === sentiment)
    }

    // Apply sorting
    filteredNews.sort((a, b) => {
      switch (sortBy) {
        case "sentiment":
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 }
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment]
        case "impact":
          return b.impact - a.impact
        case "date":
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNews = filteredNews.slice(startIndex, endIndex)

    return NextResponse.json({
      articles: paginatedNews,
      total: filteredNews.length,
      page,
      limit,
      totalPages: Math.ceil(filteredNews.length / limit),
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
