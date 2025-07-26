"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiveNewsFeed } from "@/components/live-news-feed"
import { NewsWidget } from "@/components/news-widget"
import { BackToDashboard, FloatingDashboardButton } from "@/components/back-to-dashboard"
import { NewsAnalytics } from "@/components/news/news-analytics"
import { TrendingTopics } from "@/components/news/trending-topics"
import { MarketSentiment } from "@/components/news/market-sentiment"
import { NewsAlerts } from "@/components/news/news-alerts"
import { SocialSentiment } from "@/components/news/social-sentiment"
import { PriceImpactAnalysis } from "@/components/news/price-impact-analysis"
import { NewsBookmarks } from "@/components/news/news-bookmarks"
import { Search, RefreshCw, TrendingUp, Clock, Globe, Settings, Eye, MessageSquare } from "lucide-react"

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [timeFilter, setTimeFilter] = useState("24h")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const newsStats = {
    todayArticles: 247,
    yesterdayChange: 23,
    trendingTopic: "Bitcoin ETF",
    topicMentions: 67,
    marketSentiment: "Bullish",
    sentimentScore: 78,
    savedArticles: 15,
    newSaved: 4,
    totalViews: "2.4M",
    avgReadTime: "3.2min",
  }

  const categories = [
    { id: "all", name: "All News", count: 247 },
    { id: "bitcoin", name: "Bitcoin", count: 89 },
    { id: "ethereum", name: "Ethereum", count: 67 },
    { id: "defi", name: "DeFi", count: 45 },
    { id: "nft", name: "NFTs", count: 23 },
    { id: "regulation", name: "Regulation", count: 34 },
    { id: "technology", name: "Technology", count: 56 },
    { id: "trading", name: "Trading", count: 78 },
    { id: "altcoins", name: "Altcoins", count: 91 },
  ]

  const sources = [
    { id: "all", name: "All Sources" },
    { id: "coindesk", name: "CoinDesk" },
    { id: "cointelegraph", name: "Cointelegraph" },
    { id: "bloomberg", name: "Bloomberg" },
    { id: "reuters", name: "Reuters" },
    { id: "cnbc", name: "CNBC" },
    { id: "cryptonews", name: "CryptoNews" },
    { id: "decrypt", name: "Decrypt" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackToDashboard />
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#30D5C8] to-blue-400 bg-clip-text text-transparent">
                📰 Crypto News Hub
              </h1>
              <p className="text-gray-300 mt-2">
                Real-time cryptocurrency news, analysis, and market insights powered by AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* News Stats Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Today's Articles</CardTitle>
              <Globe className="h-4 w-4 text-[#30D5C8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{newsStats.todayArticles}</div>
              <p className="text-xs text-gray-400">
                <span className="text-green-400">+{newsStats.yesterdayChange}</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Trending Topic</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{newsStats.trendingTopic}</div>
              <p className="text-xs text-gray-400">
                <span className="text-blue-400">{newsStats.topicMentions} mentions</span> today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Market Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{newsStats.marketSentiment}</div>
              <p className="text-xs text-gray-400">
                <span className="text-green-400">{newsStats.sentimentScore}%</span> positive sentiment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Engagement</CardTitle>
              <Eye className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{newsStats.totalViews}</div>
              <p className="text-xs text-gray-400">
                <span className="text-purple-400">{newsStats.avgReadTime}</span> avg read time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search and Filters */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Search className="h-5 w-5 mr-2 text-[#30D5C8]" />
              Advanced News Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">🟢 Bullish</SelectItem>
                  <SelectItem value="negative">🔴 Bearish</SelectItem>
                  <SelectItem value="neutral">⚪ Neutral</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer capitalize transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#30D5C8] text-black hover:bg-[#30D5C8]/80"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="feed" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
              📰 News Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
              🔥 Trending
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
              🔔 Alerts
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
              👥 Social
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
              💾 Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <LiveNewsFeed variant="full" />
              </div>
              <div className="space-y-6">
                <NewsWidget />
                <TrendingTopics />
                <MarketSentiment />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-orange-400" />
                      Trending Stories
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Most popular crypto news in the last 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          rank: 1,
                          title: "Bitcoin Reaches New All-Time High Above $75,000",
                          source: "CoinDesk",
                          time: "2 hours ago",
                          sentiment: "bullish",
                          engagement: "12.4K",
                          impact: "high",
                          priceChange: "+8.5%",
                        },
                        {
                          rank: 2,
                          title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
                          source: "CryptoNews",
                          time: "4 hours ago",
                          sentiment: "bullish",
                          engagement: "8.7K",
                          impact: "medium",
                          priceChange: "+5.2%",
                        },
                        {
                          rank: 3,
                          title: "Major Exchange Announces New DeFi Integration",
                          source: "BlockNews",
                          time: "6 hours ago",
                          sentiment: "neutral",
                          engagement: "6.1K",
                          impact: "medium",
                          priceChange: "+1.8%",
                        },
                        {
                          rank: 4,
                          title: "SEC Approves Three More Bitcoin ETF Applications",
                          source: "Reuters",
                          time: "8 hours ago",
                          sentiment: "bullish",
                          engagement: "15.2K",
                          impact: "high",
                          priceChange: "+12.3%",
                        },
                        {
                          rank: 5,
                          title: "Altcoin Season Indicators Flash Strong Buy Signals",
                          source: "CryptoPanic",
                          time: "10 hours ago",
                          sentiment: "bullish",
                          engagement: "9.8K",
                          impact: "medium",
                          priceChange: "+7.1%",
                        },
                      ].map((article, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-800 rounded-lg hover:border-[#30D5C8]/50 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#30D5C8]/20 text-[#30D5C8] font-bold text-sm">
                                #{article.rank}
                              </div>
                              <Badge
                                variant={
                                  article.impact === "high"
                                    ? "destructive"
                                    : article.impact === "medium"
                                      ? "default"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {article.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-medium ${article.priceChange.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                              >
                                {article.priceChange}
                              </div>
                            </div>
                          </div>

                          <h3 className="font-semibold text-white mb-2 group-hover:text-[#30D5C8] transition-colors">
                            {article.title}
                          </h3>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">{article.source}</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{article.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.engagement}</span>
                              </div>
                              <Badge
                                variant={article.sentiment === "bullish" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {article.sentiment === "bullish" ? "🟢" : article.sentiment === "bearish" ? "🔴" : "⚪"}{" "}
                                {article.sentiment}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <PriceImpactAnalysis />
                <SocialSentiment />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <NewsAnalytics />
          </TabsContent>

          <TabsContent value="alerts">
            <NewsAlerts />
          </TabsContent>

          <TabsContent value="social">
            <div className="grid gap-6 lg:grid-cols-2">
              <SocialSentiment />
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                    Community Discussions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        platform: "Reddit",
                        topic: "Bitcoin ETF Approval Impact",
                        comments: 1247,
                        sentiment: "bullish",
                        engagement: "high",
                      },
                      {
                        platform: "Twitter",
                        topic: "#EthereumMerge Success",
                        comments: 892,
                        sentiment: "bullish",
                        engagement: "medium",
                      },
                      {
                        platform: "Discord",
                        topic: "DeFi Protocol Updates",
                        comments: 456,
                        sentiment: "neutral",
                        engagement: "medium",
                      },
                    ].map((discussion, index) => (
                      <div key={index} className="p-3 border border-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {discussion.platform}
                          </Badge>
                          <Badge variant={discussion.engagement === "high" ? "default" : "outline"} className="text-xs">
                            {discussion.engagement} engagement
                          </Badge>
                        </div>
                        <h4 className="text-white font-medium mb-1">{discussion.topic}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{discussion.comments} comments</span>
                          </div>
                          <Badge
                            variant={discussion.sentiment === "bullish" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {discussion.sentiment}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <NewsBookmarks />
          </TabsContent>
        </Tabs>

        <FloatingDashboardButton />
      </div>
    </div>
  )
}
