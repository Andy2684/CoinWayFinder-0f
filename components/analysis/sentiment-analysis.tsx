"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, MessageCircle, Twitter, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react"

interface SentimentData {
  overall: number
  social: number
  news: number
  fearGreed: number
  reddit: number
  twitter: number
}

interface SentimentSource {
  platform: string
  sentiment: number
  volume: number
  change24h: number
}

interface NewsItem {
  title: string
  sentiment: number
  source: string
  timestamp: string
  impact: "high" | "medium" | "low"
}

export function SentimentAnalysis() {
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    overall: 0,
    social: 0,
    news: 0,
    fearGreed: 0,
    reddit: 0,
    twitter: 0,
  })
  const [sources, setSources] = useState<SentimentSource[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSentimentData()
  }, [])

  const fetchSentimentData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analysis/sentiment")

      // Mock data for demonstration
      const mockSentimentData: SentimentData = {
        overall: 72,
        social: 68,
        news: 75,
        fearGreed: 45,
        reddit: 71,
        twitter: 65,
      }

      const mockSources: SentimentSource[] = [
        { platform: "Twitter", sentiment: 65, volume: 15420, change24h: 5.2 },
        { platform: "Reddit", sentiment: 71, volume: 8930, change24h: -2.1 },
        { platform: "Telegram", sentiment: 58, volume: 12340, change24h: 8.7 },
        { platform: "Discord", sentiment: 73, volume: 5670, change24h: 1.4 },
        { platform: "News", sentiment: 75, volume: 234, change24h: 12.3 },
      ]

      const mockNews: NewsItem[] = [
        {
          title: "Bitcoin ETF Approval Boosts Market Confidence",
          sentiment: 85,
          source: "CoinDesk",
          timestamp: "2 hours ago",
          impact: "high",
        },
        {
          title: "Ethereum 2.0 Staking Rewards Increase",
          sentiment: 78,
          source: "CryptoNews",
          timestamp: "4 hours ago",
          impact: "medium",
        },
        {
          title: "Regulatory Concerns in Asian Markets",
          sentiment: 25,
          source: "Reuters",
          timestamp: "6 hours ago",
          impact: "high",
        },
        {
          title: "DeFi Protocol Launches New Features",
          sentiment: 72,
          source: "DeFi Pulse",
          timestamp: "8 hours ago",
          impact: "low",
        },
      ]

      setSentimentData(mockSentimentData)
      setSources(mockSources)
      setNews(mockNews)
    } catch (error) {
      console.error("Error fetching sentiment data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "text-green-600"
    if (sentiment >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getSentimentBg = (sentiment: number) => {
    if (sentiment >= 70) return "bg-green-100"
    if (sentiment >= 40) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 80) return "Very Bullish"
    if (sentiment >= 60) return "Bullish"
    if (sentiment >= 40) return "Neutral"
    if (sentiment >= 20) return "Bearish"
    return "Very Bearish"
  }

  const pieData = [
    { name: "Positive", value: sentimentData.overall, color: "#10b981" },
    { name: "Neutral", value: 100 - sentimentData.overall - (100 - sentimentData.overall) * 0.3, color: "#f59e0b" },
    { name: "Negative", value: (100 - sentimentData.overall) * 0.3, color: "#ef4444" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Market Sentiment Analysis
            <Button variant="outline" size="sm" onClick={fetchSentimentData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Real-time sentiment analysis from social media, news, and market indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className={getSentimentBg(sentimentData.overall)}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{sentimentData.overall}%</div>
                  <div className="text-sm font-medium mb-2">{getSentimentLabel(sentimentData.overall)}</div>
                  <Badge variant="secondary">Overall Sentiment</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <Badge variant="outline">Sentiment Distribution</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fear & Greed Index</span>
                    <span className={`font-bold ${getSentimentColor(sentimentData.fearGreed)}`}>
                      {sentimentData.fearGreed}
                    </span>
                  </div>
                  <Progress value={sentimentData.fearGreed} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Sentiment</span>
                    <span className={`font-bold ${getSentimentColor(sentimentData.social)}`}>
                      {sentimentData.social}%
                    </span>
                  </div>
                  <Progress value={sentimentData.social} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">News Sentiment</span>
                    <span className={`font-bold ${getSentimentColor(sentimentData.news)}`}>{sentimentData.news}%</span>
                  </div>
                  <Progress value={sentimentData.news} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Sentiment Sources</TabsTrigger>
          <TabsTrigger value="news">News Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trending Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment by Platform</CardTitle>
              <CardDescription>Sentiment scores across different social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sentiment" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {source.platform === "Twitter" && <Twitter className="h-4 w-4" />}
                      {source.platform === "Reddit" && <MessageCircle className="h-4 w-4" />}
                      <span className="font-medium">{source.platform}</span>
                    </div>
                    <Badge className={getSentimentColor(source.sentiment)}>{source.sentiment}%</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Volume (24h)</span>
                      <span>{source.volume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change (24h)</span>
                      <span className={source.change24h > 0 ? "text-green-600" : "text-red-600"}>
                        {source.change24h > 0 ? "+" : ""}
                        {source.change24h}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent News Sentiment</CardTitle>
              <CardDescription>Sentiment analysis of recent cryptocurrency news</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {news.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.impact === "high" ? "destructive" : item.impact === "medium" ? "default" : "secondary"
                          }
                        >
                          {item.impact} impact
                        </Badge>
                        {item.sentiment >= 60 ? (
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {item.source} • {item.timestamp}
                      </span>
                      <span className={getSentimentColor(item.sentiment)}>Sentiment: {item.sentiment}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
              <CardDescription>Most discussed cryptocurrency topics in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Positive Trends</h4>
                  {["Bitcoin ETF", "Ethereum Upgrade", "DeFi Innovation", "Institutional Adoption"].map(
                    (trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{trend}</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    ),
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Negative Trends</h4>
                  {["Regulatory Concerns", "Market Volatility", "Security Issues", "Exchange Problems"].map(
                    (trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">{trend}</span>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
