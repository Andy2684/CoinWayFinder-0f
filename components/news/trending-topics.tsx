"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Flame, Hash, ExternalLink } from "lucide-react"

export function TrendingTopics() {
  const trendingTopics = [
    {
      topic: "Bitcoin ETF",
      mentions: 1247,
      change: "+45%",
      sentiment: "bullish",
      trend: "up",
      relatedCoins: ["BTC", "GBTC"],
    },
    {
      topic: "Ethereum Merge",
      mentions: 892,
      change: "+23%",
      sentiment: "bullish",
      trend: "up",
      relatedCoins: ["ETH", "STETH"],
    },
    {
      topic: "DeFi Yields",
      mentions: 567,
      change: "-12%",
      sentiment: "neutral",
      trend: "down",
      relatedCoins: ["UNI", "AAVE", "COMP"],
    },
    {
      topic: "NFT Market",
      mentions: 434,
      change: "-8%",
      sentiment: "bearish",
      trend: "down",
      relatedCoins: ["BLUR", "LOOKS"],
    },
    {
      topic: "Layer 2 Scaling",
      mentions: 389,
      change: "+18%",
      sentiment: "bullish",
      trend: "up",
      relatedCoins: ["MATIC", "ARB", "OP"],
    },
  ]

  const hashtags = [
    { tag: "#Bitcoin", count: "12.4K", hot: true },
    { tag: "#Ethereum", count: "8.7K", hot: true },
    { tag: "#DeFi", count: "5.2K", hot: false },
    { tag: "#NFTs", count: "3.8K", hot: false },
    { tag: "#Web3", count: "2.9K", hot: false },
    { tag: "#Altcoins", count: "2.1K", hot: false },
  ]

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Flame className="h-5 w-5 mr-2 text-orange-400" />🔥 Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Trending Topics */}
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={topic.topic}
              className="flex items-center justify-between p-3 border border-gray-800 rounded-lg hover:border-[#30D5C8]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#30D5C8]/20 text-[#30D5C8] font-bold text-xs">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">{topic.topic}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-gray-400 text-xs">{topic.mentions} mentions</span>
                    <div className="flex items-center space-x-1">
                      {topic.relatedCoins.slice(0, 2).map((coin) => (
                        <Badge key={coin} variant="outline" className="text-xs px-1 py-0">
                          {coin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    topic.trend === "up" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {topic.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{topic.change}</span>
                </div>
                <Badge
                  variant={
                    topic.sentiment === "bullish"
                      ? "default"
                      : topic.sentiment === "bearish"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs mt-1"
                >
                  {topic.sentiment}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Hashtags */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Hash className="h-4 w-4 mr-1 text-blue-400" />
            Trending Hashtags
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {hashtags.map((hashtag) => (
              <div
                key={hashtag.tag}
                className="flex items-center justify-between p-2 border border-gray-800 rounded text-sm"
              >
                <div className="flex items-center space-x-1">
                  <span className="text-blue-400">{hashtag.tag}</span>
                  {hashtag.hot && <Flame className="h-3 w-3 text-orange-400" />}
                </div>
                <span className="text-gray-400 text-xs">{hashtag.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View More Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          View All Trends
        </Button>
      </CardContent>
    </Card>
  )
}
