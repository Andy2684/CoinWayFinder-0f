import { NextResponse } from "next/server"

// Mock news data
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $100,000",
    summary:
      "Bitcoin has surged past the $100,000 milestone for the first time in history, driven by institutional adoption and regulatory clarity.",
    url: "https://example.com/news/1",
    source: "CryptoNews",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    sentiment: "positive",
    impact: "high",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Increase to 5.2%",
    summary:
      "The latest Ethereum network upgrade has resulted in higher staking rewards, attracting more validators to the network.",
    url: "https://example.com/news/2",
    source: "EthereumDaily",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sentiment: "positive",
    impact: "medium",
  },
  {
    id: "3",
    title: "Major Exchange Announces New DeFi Trading Pairs",
    summary:
      "Leading cryptocurrency exchange adds support for 15 new DeFi tokens, expanding trading opportunities for users.",
    url: "https://example.com/news/3",
    source: "DeFiTimes",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    sentiment: "neutral",
    impact: "medium",
  },
  {
    id: "4",
    title: "Regulatory Concerns Impact Altcoin Market",
    summary:
      "New regulatory proposals have caused uncertainty in the altcoin market, with several tokens experiencing significant volatility.",
    url: "https://example.com/news/4",
    source: "RegulationWatch",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    sentiment: "negative",
    impact: "high",
  },
  {
    id: "5",
    title: "NFT Marketplace Launches Cross-Chain Support",
    summary:
      "Popular NFT marketplace now supports multiple blockchains, allowing users to trade NFTs across different networks.",
    url: "https://example.com/news/5",
    source: "NFTWorld",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    sentiment: "positive",
    impact: "low",
  },
]

export async function GET() {
  try {
    return NextResponse.json({ news: mockNews })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
