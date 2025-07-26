"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Heart, Bookmark, Eye, Clock } from "lucide-react"

export function PersonalizedFeed() {
  const [preferences, setPreferences] = useState({
    bitcoin: true,
    ethereum: true,
    defi: false,
    nfts: false,
    regulation: true,
    technology: true,
  })

  const personalizedArticles = [
    {
      id: 1,
      title: "Bitcoin Technical Analysis: Key Support Levels to Watch",
      summary: "Based on your trading interests, here's what technical analysts are saying...",
      source: "CoinDesk",
      time: "1h ago",
      relevanceScore: 95,
      readTime: "3 min",
      bookmarked: false,
      liked: true,
      category: "bitcoin",
    },
    {
      id: 2,
      title: "Ethereum Layer 2 Solutions Gaining Momentum",
      summary: "Following your DeFi interests, here are the latest L2 developments...",
      source: "Decrypt",
      time: "2h ago",
      relevanceScore: 88,
      readTime: "4 min",
      bookmarked: true,
      liked: false,
      category: "ethereum",
    },
    {
      id: 3,
      title: "New Cryptocurrency Regulations in Europe",
      summary: "Important regulatory updates that may affect your portfolio...",
      source: "Reuters",
      time: "3h ago",
      relevanceScore: 82,
      readTime: "5 min",
      bookmarked: false,
      liked: false,
      category: "regulation",
    },
  ]

  const togglePreference = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Personalization Settings */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-[#30D5C8]" />👤 Your Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                <span className="text-white capitalize">{key}</span>
                <Switch checked={value} onCheckedChange={() => togglePreference(key)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Articles */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-400" />📰 Your Personalized Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizedArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 border border-gray-800 rounded-lg hover:border-[#30D5C8]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {article.category}
                      </Badge>
                      <Badge className={`text-xs ${getRelevanceColor(article.relevanceScore)}`}>
                        {article.relevanceScore}% match
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{article.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{article.summary}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{article.source}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className={article.liked ? "text-pink-400" : "text-gray-400"}>
                      <Heart className={`h-4 w-4 ${article.liked ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={article.bookmarked ? "text-blue-400" : "text-gray-400"}
                    >
                      <Bookmark className={`h-4 w-4 ${article.bookmarked ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
