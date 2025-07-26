"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  Globe,
  Target,
  PieChart,
  LineChart,
  Calendar,
  Download,
} from "lucide-react"

export function NewsAnalytics() {
  const [timeRange, setTimeRange] = useState("7d")

  const analyticsData = {
    totalArticles: 1847,
    totalViews: "12.4M",
    avgEngagement: "4.2%",
    topSources: [
      { name: "CoinDesk", articles: 234, engagement: "8.7%" },
      { name: "Cointelegraph", articles: 189, engagement: "7.2%" },
      { name: "Bloomberg", articles: 156, engagement: "9.1%" },
      { name: "Reuters", articles: 134, engagement: "6.8%" },
      { name: "CNBC", articles: 98, engagement: "5.4%" },
    ],
    sentimentBreakdown: {
      bullish: 45,
      bearish: 23,
      neutral: 32,
    },
    categoryPerformance: [
      { category: "Bitcoin", articles: 456, views: "3.2M", sentiment: 78 },
      { category: "Ethereum", articles: 334, views: "2.1M", sentiment: 72 },
      { category: "DeFi", articles: 267, views: "1.8M", sentiment: 65 },
      { category: "NFTs", articles: 189, views: "1.2M", sentiment: 58 },
      { category: "Regulation", articles: 234, views: "2.4M", sentiment: 42 },
    ],
    hourlyActivity: [
      { hour: "00:00", articles: 12, engagement: 3.2 },
      { hour: "06:00", articles: 45, engagement: 5.8 },
      { hour: "12:00", articles: 89, engagement: 8.4 },
      { hour: "18:00", articles: 67, engagement: 7.1 },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 News Analytics</h2>
          <p className="text-gray-400">Comprehensive insights into crypto news performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Articles</CardTitle>
            <Globe className="h-4 w-4 text-[#30D5C8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalArticles}</div>
            <p className="text-xs text-gray-400">
              <span className="text-green-400">+12.5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalViews}</div>
            <p className="text-xs text-gray-400">
              <span className="text-green-400">+18.2%</span> engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Engagement</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.avgEngagement}</div>
            <p className="text-xs text-gray-400">
              <span className="text-green-400">+0.8%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Sentiment Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Bullish</div>
            <p className="text-xs text-gray-400">
              <span className="text-green-400">78%</span> positive sentiment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="overview">📈 Overview</TabsTrigger>
          <TabsTrigger value="sources">📰 Sources</TabsTrigger>
          <TabsTrigger value="sentiment">💭 Sentiment</TabsTrigger>
          <TabsTrigger value="categories">🏷️ Categories</TabsTrigger>
          <TabsTrigger value="timing">⏰ Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-[#30D5C8]" />
                  Article Volume Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                    const volume = Math.floor(Math.random() * 100) + 50
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-gray-300 w-12">{day}</span>
                        <div className="flex-1 mx-4">
                          <Progress value={volume} className="h-2" />
                        </div>
                        <span className="text-white font-medium w-12 text-right">{volume}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-400" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Click-through Rate</span>
                    <span className="text-white font-medium">8.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Average Read Time</span>
                    <span className="text-white font-medium">3.2 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Share Rate</span>
                    <span className="text-white font-medium">2.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Bookmark Rate</span>
                    <span className="text-white font-medium">1.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Comment Rate</span>
                    <span className="text-white font-medium">0.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-[#30D5C8]" />
                Top News Sources Performance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Source performance ranked by article count and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topSources.map((source, index) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#30D5C8]/20 text-[#30D5C8] font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{source.name}</h4>
                        <p className="text-gray-400 text-sm">{source.articles} articles published</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{source.engagement}</div>
                      <p className="text-gray-400 text-sm">engagement rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-[#30D5C8]" />
                  Sentiment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-gray-300">Bullish</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{analyticsData.sentimentBreakdown.bullish}%</span>
                      <Progress value={analyticsData.sentimentBreakdown.bullish} className="w-20 h-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-gray-300">Bearish</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{analyticsData.sentimentBreakdown.bearish}%</span>
                      <Progress value={analyticsData.sentimentBreakdown.bearish} className="w-20 h-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-gray-300">Neutral</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{analyticsData.sentimentBreakdown.neutral}%</span>
                      <Progress value={analyticsData.sentimentBreakdown.neutral} className="w-20 h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-400" />
                  Sentiment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Today", "Yesterday", "2 days ago", "3 days ago", "4 days ago"].map((day, index) => {
                    const sentiment = Math.floor(Math.random() * 40) + 40
                    const isPositive = sentiment > 50
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-gray-300">{day}</span>
                        <div className="flex items-center space-x-2">
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                            {sentiment}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-[#30D5C8]" />
                Category Performance Analysis
              </CardTitle>
              <CardDescription className="text-gray-400">Performance metrics by news category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.categoryPerformance.map((category, index) => (
                  <div key={category.category} className="p-4 border border-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{category.category}</h4>
                      <Badge
                        variant={
                          category.sentiment > 60 ? "default" : category.sentiment > 40 ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {category.sentiment}% sentiment
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Articles:</span>
                        <span className="text-white font-medium ml-2">{category.articles}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Views:</span>
                        <span className="text-white font-medium ml-2">{category.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-400" />
                Publishing & Engagement Timing
              </CardTitle>
              <CardDescription className="text-gray-400">
                Optimal times for news publishing and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Hourly Activity</h4>
                  <div className="space-y-3">
                    {analyticsData.hourlyActivity.map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between">
                        <span className="text-gray-300 w-16">{hour.hour}</span>
                        <div className="flex-1 mx-4">
                          <Progress value={hour.articles} className="h-2" />
                        </div>
                        <div className="text-right">
                          <span className="text-white font-medium">{hour.articles} articles</span>
                          <span className="text-gray-400 text-sm ml-2">({hour.engagement}% eng.)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Best Publishing Times</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-800 rounded-lg">
                      <div className="text-[#30D5C8] font-medium">Peak Engagement</div>
                      <div className="text-white text-lg">2:00 PM - 4:00 PM</div>
                      <div className="text-gray-400 text-sm">UTC timezone</div>
                    </div>
                    <div className="p-3 border border-gray-800 rounded-lg">
                      <div className="text-orange-400 font-medium">Highest Volume</div>
                      <div className="text-white text-lg">12:00 PM - 2:00 PM</div>
                      <div className="text-gray-400 text-sm">UTC timezone</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
