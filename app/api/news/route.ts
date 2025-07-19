import { type NextRequest, NextResponse } from "next/server"

// Mock news data with realistic crypto content
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
    summary:
      "Bitcoin has broken through previous resistance levels, reaching a new all-time high of $73,000 as major institutions continue to add BTC to their balance sheets.",
    content:
      "Bitcoin's remarkable rally continues as the world's largest cryptocurrency by market capitalization has reached a new all-time high of $73,000. This surge comes amid growing institutional adoption, with several Fortune 500 companies announcing significant Bitcoin purchases for their treasury reserves. The rally has been fueled by increased demand from institutional investors, improved regulatory clarity, and growing acceptance of Bitcoin as a store of value. Market analysts suggest that this could be the beginning of a new bull cycle, with some predicting Bitcoin could reach $100,000 by the end of the year. The surge has also positively impacted the broader cryptocurrency market, with Ethereum and other major altcoins experiencing significant gains.",
    source: "CryptoNews Daily",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    url: "https://example.com/bitcoin-ath",
    image_url: "/placeholder.svg?height=200&width=400&text=Bitcoin+ATH",
    sentiment: "positive" as const,
    impact_score: 9,
    tags: ["Bitcoin", "ATH", "Institutional", "Bull Market"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures",
    summary:
      "Ethereum staking rewards have dropped to historic lows as the network becomes more decentralized and efficient, signaling maturation of the proof-of-stake consensus.",
    content:
      "Ethereum's transition to proof-of-stake has reached a new milestone as staking rewards have hit record lows, dropping below 3% APR for the first time since the merge. This decline in rewards is actually a positive indicator of network health, as it demonstrates increased participation in staking and improved network security. With over 32 million ETH now staked, representing approximately 26% of the total supply, the network has achieved unprecedented decentralization. Lower rewards also indicate reduced inflation pressure on ETH, potentially making it more attractive as a store of value. Despite lower staking yields, institutional interest in Ethereum staking continues to grow, with several major financial institutions launching Ethereum staking services for their clients.",
    source: "Ethereum Foundation",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    url: "https://example.com/ethereum-staking",
    image_url: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
    sentiment: "neutral" as const,
    impact_score: 6,
    tags: ["Ethereum", "Staking", "PoS", "Network"],
  },
  {
    id: "3",
    title: "Major DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability",
    summary:
      "A popular DeFi lending protocol has been exploited for $50 million due to a critical smart contract vulnerability, highlighting ongoing security challenges in decentralized finance.",
    content:
      "The DeFi space has been rocked by another major exploit as a leading lending protocol lost $50 million to hackers who exploited a critical vulnerability in the platform's smart contract code. The attack occurred during a routine protocol upgrade, where attackers identified and exploited a reentrancy vulnerability that allowed them to drain funds from the protocol's liquidity pools. This incident marks the largest DeFi hack of the year and has reignited discussions about the security challenges facing decentralized finance. The protocol's team has acknowledged the exploit and is working with security firms and law enforcement to track the stolen funds. Users are advised to withdraw their funds from the platform while the team works on implementing additional security measures. This incident serves as a stark reminder of the risks associated with DeFi protocols and the importance of thorough security audits.",
    source: "DeFi Security Watch",
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    url: "https://example.com/defi-exploit",
    image_url: "/placeholder.svg?height=200&width=400&text=DeFi+Exploit",
    sentiment: "negative" as const,
    impact_score: 8,
    tags: ["DeFi", "Security", "Exploit", "Smart Contracts"],
  },
  {
    id: "4",
    title: "Central Bank Digital Currency Pilots Show Promising Results Across Multiple Countries",
    summary:
      "Several central banks report positive outcomes from their CBDC pilot programs, with improved transaction efficiency and financial inclusion being key benefits.",
    content:
      "Central Bank Digital Currencies (CBDCs) are gaining momentum as pilot programs across multiple countries show promising results. The Bank of England, European Central Bank, and People's Bank of China have all reported positive outcomes from their respective digital currency trials. Key benefits identified include faster cross-border payments, improved financial inclusion for unbanked populations, and enhanced monetary policy transmission. The digital yuan pilot in China has processed over $13 billion in transactions, while the EU's digital euro project has successfully completed its investigation phase. However, concerns about privacy and the potential impact on commercial banks remain significant challenges that need to be addressed before full-scale implementation. Central banks are working closely with technology partners and regulatory bodies to ensure that CBDCs can coexist with existing financial infrastructure while providing the benefits of digital currencies.",
    source: "Central Banking Today",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    url: "https://example.com/cbdc-pilots",
    image_url: "/placeholder.svg?height=200&width=400&text=CBDC+Pilots",
    sentiment: "positive" as const,
    impact_score: 7,
    tags: ["CBDC", "Central Banks", "Digital Currency", "Regulation"],
  },
  {
    id: "5",
    title: "NFT Market Shows Signs of Recovery with New Utility-Focused Projects",
    summary:
      "The NFT market is experiencing renewed interest as projects focus on utility and real-world applications rather than speculative trading.",
    content:
      "After a prolonged bear market, the NFT space is showing signs of recovery as new projects focus on utility and real-world applications rather than purely speculative assets. Gaming NFTs, digital identity solutions, and tokenized real estate are leading the recovery, with trading volumes up 40% over the past month. Major brands are also re-entering the space with more sophisticated approaches, focusing on customer engagement and loyalty programs rather than quick cash grabs. The shift towards utility-driven NFTs has attracted institutional investors who previously avoided the space due to its speculative nature. Educational institutions are also exploring NFTs for credential verification, while artists are using the technology to create new forms of interactive digital art. This evolution suggests that the NFT market is maturing beyond the initial hype cycle and finding sustainable use cases that provide genuine value to users.",
    source: "NFT Insider",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    url: "https://example.com/nft-recovery",
    image_url: "/placeholder.svg?height=200&width=400&text=NFT+Recovery",
    sentiment: "positive" as const,
    impact_score: 5,
    tags: ["NFT", "Utility", "Gaming", "Digital Art"],
  },
  {
    id: "6",
    title: "Regulatory Clarity Emerges as Multiple Jurisdictions Finalize Crypto Frameworks",
    summary:
      "Several major jurisdictions have finalized comprehensive cryptocurrency regulatory frameworks, providing much-needed clarity for businesses and investors.",
    content:
      "The cryptocurrency industry is celebrating a wave of regulatory clarity as multiple major jurisdictions have finalized comprehensive frameworks for digital assets. The European Union's Markets in Crypto-Assets (MiCA) regulation has officially come into effect, providing clear guidelines for crypto businesses operating within the EU. Similarly, the UK has published its final rules for crypto asset activities, while Singapore has updated its Payment Services Act to include detailed provisions for digital payment tokens. These regulatory developments are being welcomed by industry participants who have long called for clear rules of engagement. The new frameworks address key areas including consumer protection, anti-money laundering requirements, and operational standards for crypto exchanges and service providers. Industry experts believe that this regulatory clarity will pave the way for increased institutional adoption and mainstream acceptance of cryptocurrencies.",
    source: "Regulatory Affairs Weekly",
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    url: "https://example.com/crypto-regulation",
    image_url: "/placeholder.svg?height=200&width=400&text=Crypto+Regulation",
    sentiment: "positive" as const,
    impact_score: 8,
    tags: ["Regulation", "MiCA", "Compliance", "Legal"],
  },
  {
    id: "7",
    title: "Layer 2 Solutions See Massive Growth as Ethereum Gas Fees Remain High",
    summary:
      "Ethereum Layer 2 scaling solutions are experiencing unprecedented growth as users seek alternatives to high mainnet transaction fees.",
    content:
      "Ethereum Layer 2 scaling solutions are experiencing explosive growth as users and developers migrate to avoid high mainnet transaction fees. Arbitrum, Optimism, and Polygon have all reported record-breaking transaction volumes and total value locked (TVL) in recent weeks. The combined TVL across major Layer 2 networks has surpassed $15 billion, representing a 300% increase from the beginning of the year. This growth is being driven by both retail users seeking cheaper transactions and DeFi protocols expanding their presence across multiple chains. Major decentralized exchanges like Uniswap and SushiSwap have seen significant volume migration to Layer 2 networks, where users can trade with fees as low as a few cents compared to $20-50 on Ethereum mainnet. The success of Layer 2 solutions is also attracting institutional attention, with several major financial institutions exploring partnerships with Layer 2 protocols to offer their clients access to DeFi services at scale.",
    source: "Layer 2 Analytics",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    url: "https://example.com/layer2-growth",
    image_url: "/placeholder.svg?height=200&width=400&text=Layer+2+Growth",
    sentiment: "positive" as const,
    impact_score: 7,
    tags: ["Layer 2", "Scaling", "Arbitrum", "Optimism"],
  },
  {
    id: "8",
    title: "Crypto Mining Industry Faces Pressure from Environmental Concerns and Energy Costs",
    summary:
      "The cryptocurrency mining industry is under increasing pressure from environmental activists and rising energy costs, forcing miners to seek sustainable solutions.",
    content:
      "The cryptocurrency mining industry is facing mounting pressure from multiple fronts as environmental concerns and rising energy costs force miners to reconsider their operations. Several major mining companies have announced plans to transition to renewable energy sources, with some committing to achieving carbon neutrality by 2030. The pressure comes not only from environmental activists but also from investors and regulators who are increasingly focused on ESG (Environmental, Social, and Governance) criteria. Rising electricity costs in key mining regions have also made operations less profitable, particularly for smaller miners using older, less efficient equipment. In response, the industry is seeing increased investment in renewable energy infrastructure, with some mining companies partnering with solar and wind energy providers to secure long-term, sustainable power sources. Additionally, there's growing interest in alternative consensus mechanisms and more energy-efficient mining technologies that could reduce the environmental impact of cryptocurrency networks.",
    source: "Mining Industry Report",
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    url: "https://example.com/mining-environment",
    image_url: "/placeholder.svg?height=200&width=400&text=Crypto+Mining",
    sentiment: "negative" as const,
    impact_score: 6,
    tags: ["Mining", "Environment", "ESG", "Sustainability"],
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
        case "date":
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        case "sentiment":
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 }
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment]
        case "impact":
          return b.impact_score - a.impact_score
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNews = filteredNews.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedNews,
      pagination: {
        page,
        limit,
        total: filteredNews.length,
        totalPages: Math.ceil(filteredNews.length / limit),
      },
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 })
  }
}
