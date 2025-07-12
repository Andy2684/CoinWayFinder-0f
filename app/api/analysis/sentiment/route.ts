import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "BTC";

    // Mock sentiment analysis data
    const sentimentData = {
      symbol,
      platforms: [
        {
          name: "Twitter",
          sentiment: 72 + Math.random() * 20 - 10,
          volume: Math.floor(15000 + Math.random() * 10000),
          change24h: Math.random() * 20 - 10,
        },
        {
          name: "Reddit",
          sentiment: 68 + Math.random() * 20 - 10,
          volume: Math.floor(8000 + Math.random() * 5000),
          change24h: Math.random() * 20 - 10,
        },
        {
          name: "Telegram",
          sentiment: 75 + Math.random() * 15 - 7,
          volume: Math.floor(12000 + Math.random() * 8000),
          change24h: Math.random() * 25 - 12,
        },
        {
          name: "Discord",
          sentiment: 65 + Math.random() * 20 - 10,
          volume: Math.floor(5000 + Math.random() * 3000),
          change24h: Math.random() * 15 - 7,
        },
      ],
      fearGreedIndex: Math.floor(Math.random() * 100),
      news: [
        {
          title: `${symbol} ETF Sees Record Inflows This Week`,
          sentiment: "positive",
          score: 0.85,
          source: "CoinDesk",
          timestamp: "2 hours ago",
        },
        {
          title: "Regulatory Concerns Impact Crypto Market",
          sentiment: "negative",
          score: -0.62,
          source: "Bloomberg",
          timestamp: "4 hours ago",
        },
        {
          title: "Major Exchange Announces New Features",
          sentiment: "positive",
          score: 0.73,
          source: "CryptoNews",
          timestamp: "6 hours ago",
        },
      ],
      trendingTopics: [
        { topic: `${symbol} ETF`, mentions: 2340, sentiment: 78, change: 15.2 },
        { topic: "DeFi Protocol", mentions: 1890, sentiment: 65, change: -3.4 },
        {
          topic: "Layer 2 Solutions",
          mentions: 1560,
          sentiment: 82,
          change: 22.1,
        },
        {
          topic: "NFT Marketplace",
          mentions: 1230,
          sentiment: 58,
          change: -8.7,
        },
      ],
    };

    return NextResponse.json(sentimentData);
  } catch (error) {
    console.error("Sentiment analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment analysis data" },
      { status: 500 },
    );
  }
}
