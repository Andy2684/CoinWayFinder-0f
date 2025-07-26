"use client"

import { Suspense } from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"
import { NewsAnalytics } from "@/components/news/news-analytics"
import { TrendingTopics } from "@/components/news/trending-topics"
import { MarketSentiment } from "@/components/news/market-sentiment"
import { NewsAlerts } from "@/components/news/news-alerts"
import { SocialSentiment } from "@/components/news/social-sentiment"
import { PriceImpactAnalysis } from "@/components/news/price-impact-analysis"
import { PersonalizedFeed } from "@/components/news/personalized-feed"
import { NewsBookmarks } from "@/components/news/news-bookmarks"
import { Search, Filter, Bell, Bookmark, TrendingUp, Globe, Twitter, MessageSquare } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Crypto News & Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Stay ahead of the market with real-time news, sentiment analysis, and AI-powered insights
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search news, coins, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500"
            />
          </div>
          <Button variant="outline" className="h-12 px-6 bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="h-12 px-6 bg-transparent">
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </Button>
        </div>

        {/* News Stats Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <MessageSquare className="h-4 w-4 text-purple-400" />
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
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Sentiment</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <span className="hidden sm:inline">Impact</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <Suspense fallback={<div>Loading personalized feed...</div>}>
              <PersonalizedFeed />
            </Suspense>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Suspense fallback={<div>Loading trending topics...</div>}>
              <TrendingTopics />
            </Suspense>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <Suspense fallback={<div>Loading market sentiment...</div>}>
              <MarketSentiment />
            </Suspense>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Suspense fallback={<div>Loading social sentiment...</div>}>
              <SocialSentiment />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<div>Loading news analytics...</div>}>
              <NewsAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Suspense fallback={<div>Loading news alerts...</div>}>
              <NewsAlerts />
            </Suspense>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <Suspense fallback={<div>Loading price impact analysis...</div>}>
              <PriceImpactAnalysis />
            </Suspense>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <Suspense fallback={<div>Loading bookmarks...</div>}>
              <NewsBookmarks />
            </Suspense>
          </TabsContent>
        </Tabs>

        <FloatingDashboardButton />
      </div>
    </div>
  )
}
