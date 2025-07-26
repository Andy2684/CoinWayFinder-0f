"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Heart, Share2, Twitter, ExternalLink } from "lucide-react"

export function SocialSentiment() {
  const socialData = {
    platforms: [
      {
        name: "Twitter",
        icon: Twitter,
        mentions: "45.2K",
        sentiment: 78,
        change: "+12%",
        engagement: "892K",
        trending: ["#Bitcoin", "#BTC", "#Crypto"],
      },
      {
        name: "Reddit",
        mentions: "23.1K",
        sentiment: 72,
        change: "+8%",
        engagement: "456K",
        trending: ["r/Bitcoin", "r/CryptoCurrency", "r/ethereum"],
      },
      {
        name: "Discord",
        mentions: "18.7K",
        sentiment: 85,
        change: "+15%",
        engagement: "234K",
        trending: ["Trading", "DeFi", "NFTs"],
      },
      {
        name: "Telegram",
        mentions: "31.4K",
        sentiment: 69,
        change: "+5%",
        engagement: "678K",
        trending: ["Signals", "News", "Analysis"],
      },
    ],
    topInfluencers: [
      {
        name: "@elonmusk",
        platform: "Twitter",
        followers: "150M",
        sentiment: "bullish",
        lastPost: "2h ago",
        engagement: "2.4M",
      },
      {
        name: "@VitalikButerin",
        platform: "Twitter",
        followers: "4.8M",
        sentiment: "neutral",
        lastPost: "4h ago",
        engagement: "156K",
      },
      {
        name: "@michael_saylor",
        platform: "Twitter",
        followers: "3.2M",
        sentiment: "bullish",
        lastPost: "1h ago",
        engagement: "89K",
      },
    ],
    viralPosts: [
      {
        content: "Bitcoin just broke $68,000! 🚀 This is just the beginning...",
        platform: "Twitter",
        author: "@CryptoWhale",
        likes: "12.4K",
        shares: "3.2K",
        sentiment: "bullish",
        time: "3h ago",
      },
      {
        content: "Ethereum staking rewards are looking incredible right now",
        platform: "Reddit",
        author: "u/EthStaker",
        likes: "8.7K",
        shares: "1.8K",
        sentiment: "bullish",
        time: "5h ago",
      },
      {
        content: "DeFi yields are back! Time to farm some tokens 🌾",
        platform: "Discord",
        author: "DeFiFarmer#1234",
        likes: "2.1K",
        shares: "892",
        sentiment: "neutral",
        time: "7h ago",
      },
    ],
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "text-green-400"
    if (sentiment >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "bg-green-400/20 text-green-400"
      case "bearish":
        return "bg-red-400/20 text-red-400"
      default:
        return "bg-gray-400/20 text-gray-400"
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-400" />👥 Social Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Overview */}
        <div>
          <h4 className="text-white font-medium mb-3">Platform Activity</h4>
          <div className="space-y-3">
            {socialData.platforms.map((platform) => (
              <div key={platform.name} className="p-3 border border-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {platform.icon && <platform.icon className="h-4 w-4 text-blue-400" />}
                    <span className="text-white font-medium">{platform.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {platform.mentions} mentions
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getSentimentColor(platform.sentiment)}`}>
                      {platform.sentiment}%
                    </span>
                    <span className={`text-xs ${platform.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                      {platform.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Engagement: {platform.engagement}</span>
                  <div className="flex space-x-1">
                    {platform.trending.slice(0, 2).map((trend) => (
                      <Badge key={trend} variant="outline" className="text-xs">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Influencers */}
        <div>
          <h4 className="text-white font-medium mb-3">Top Crypto Influencers</h4>
          <div className="space-y-2">
            {socialData.topInfluencers.map((influencer) => (
              <div
                key={influencer.name}
                className="flex items-center justify-between p-2 border border-gray-800 rounded"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#30D5C8] to-blue-400 flex items-center justify-center text-black font-bold text-xs">
                    {influencer.name.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{influencer.name}</div>
                    <div className="text-gray-400 text-xs">{influencer.followers} followers</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`text-xs ${getSentimentBadge(influencer.sentiment)}`}>{influencer.sentiment}</Badge>
                  <div className="text-gray-400 text-xs mt-1">{influencer.lastPost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viral Posts */}
        <div>
          <h4 className="text-white font-medium mb-3">Viral Crypto Posts</h4>
          <div className="space-y-3">
            {socialData.viralPosts.map((post, index) => (
              <div key={index} className="p-3 border border-gray-800 rounded-lg">
                <p className="text-white text-sm mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>{post.author}</span>
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                    <span>{post.time}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-3 w-3" />
                      <span>{post.shares}</span>
                    </div>
                    <Badge className={`text-xs ${getSentimentBadge(post.sentiment)}`}>{post.sentiment}</Badge>
                  </div>
                </div>
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
          View Full Social Analysis
        </Button>
      </CardContent>
    </Card>
  )
}
