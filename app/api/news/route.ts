import { NextResponse } from "next/server"

// Mock news data
const mockNews = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Above $100,000",
    summary:
      "Bitcoin has surged past the $100,000 milestone for the first time in history, driven by institutional adoption and regulatory clarity.",
    url: "https://example.com/news/1",
    publishedAt: "2024-01-15T10:30:00Z",
    source: "CryptoNews",
    sentiment: "positive",
    impact: "high",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Increase to 5.2%",
    summary:
      "The latest Ethereum network upgrade has resulted in higher staking rewards, attracting more validators to the network.",
    url: "https://example.com/news/2",
    publishedAt: "2024-01-15T09:15:00Z",
    source: "ETH Today",
    sentiment: "positive",
    impact: "medium",
  },
  {
    id: "3",
    title: "Major Exchange Announces New Security Measures",
    summary:
      "Following recent security concerns, the exchange has implemented advanced multi-signature wallets and enhanced monitoring.",
    url: "https://example.com/news/3",
    publishedAt: "2024-01-15T08:45:00Z",
    source: "Crypto Security",
    sentiment: "neutral",
    impact: "medium",
  },
  {
    id: "4",
    title: "Regulatory Framework for DeFi Protocols Proposed",
    summary:
      "New regulatory guidelines aim to provide clarity for decentralized finance protocols while maintaining innovation.",
    url: "https://example.com/news/4",
    publishedAt: "2024-01-15T07:20:00Z",
    source: "Regulatory Watch",
    sentiment: "neutral",
    impact: "high",
  },
  {
    id: "5",
    title: "Altcoin Season Shows Signs of Momentum",
    summary:
      "Several alternative cryptocurrencies are showing strong performance as market sentiment shifts toward risk-on assets.",
    url: "https://example.com/news/5",
    publishedAt: "2024-01-15T06:30:00Z",
    source: "Altcoin Daily",
    sentiment: "positive",
    impact: "medium",
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
