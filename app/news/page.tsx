import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewsAnalytics } from "@/components/news/news-analytics"
import { TrendingTopics } from "@/components/news/trending-topics"
import { MarketSentiment } from "@/components/news/market-sentiment"
import { NewsAlerts } from "@/components/news/news-alerts"
import { SocialSentiment } from "@/components/news/social-sentiment"
import { PriceImpactAnalysis } from "@/components/news/price-impact-analysis"
import { PersonalizedFeed } from "@/components/news/personalized-feed"
import { NewsBookmarks } from "@/components/news/news-bookmarks"
import { LiveNewsFeed } from "@/components/live-news-feed"
import { Search, Filter, Bell, Bookmark, TrendingUp, Globe } from "lucide-react"

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Crypto News & Market Intelligence</h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Stay ahead of the market with real-time news, sentiment analysis, and AI-powered insights from across the
            crypto ecosystem.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search news, coins, or topics..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="feed" className="data-[state=active]:bg-purple-600">
              <Globe className="h-4 w-4 mr-2" />
              News Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="data-[state=active]:bg-purple-600">
              Sentiment
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">
              Alerts
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="data-[state=active]:bg-purple-600">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Suspense fallback={<div className="text-white">Loading news feed...</div>}>
                  <LiveNewsFeed />
                </Suspense>
              </div>
              <div className="space-y-6">
                <Suspense fallback={<div className="text-white">Loading personalized feed...</div>}>
                  <PersonalizedFeed />
                </Suspense>
                <Suspense fallback={<div className="text-white">Loading market sentiment...</div>}>
                  <MarketSentiment />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<div className="text-white">Loading trending topics...</div>}>
                <TrendingTopics />
              </Suspense>
              <Suspense fallback={<div className="text-white">Loading social sentiment...</div>}>
                <SocialSentiment />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<div className="text-white">Loading market sentiment...</div>}>
                <MarketSentiment />
              </Suspense>
              <Suspense fallback={<div className="text-white">Loading price impact analysis...</div>}>
                <PriceImpactAnalysis />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<div className="text-white">Loading news analytics...</div>}>
              <NewsAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Suspense fallback={<div className="text-white">Loading news alerts...</div>}>
              <NewsAlerts />
            </Suspense>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <Suspense fallback={<div className="text-white">Loading bookmarks...</div>}>
              <NewsBookmarks />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">News Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">150+</div>
              <p className="text-xs text-slate-400">Active sources</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Daily Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2,500+</div>
              <p className="text-xs text-slate-400">Articles processed</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Sentiment Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">94.2%</div>
              <p className="text-xs text-slate-400">AI accuracy rate</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{"<"}30s</div>
              <p className="text-xs text-slate-400">Breaking news alerts</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
