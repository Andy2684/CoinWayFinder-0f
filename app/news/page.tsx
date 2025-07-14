"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, ExternalLink } from "lucide-react"
import { LiveNewsFeed } from "@/components/live-news-feed"
import { NewsWidget } from "@/components/news-widget"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  source: string
  url: string
  published_at: string
  sentiment_score: number
  impact_score: number
  tags: string[]
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("published_at")
  const [filterTag, setFilterTag] = useState("all")

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news")
      const result = await response.json()
      if (result.success) {
        setNews(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = news
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((item) => filterTag === "all" || item.tags.includes(filterTag))
    .sort((a, b) => {
      switch (sortBy) {
        case "sentiment":
          return b.sentiment_score - a.sentiment_score
        case "impact":
          return b.impact_score - a.impact_score
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }
    })

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-green-500"
    if (score < -0.3) return "text-red-500"
    return "text-yellow-500"
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <TrendingUp className="h-4 w-4" />
    if (score < -0.3) return <TrendingDown className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const allTags = Array.from(new Set(news.flatMap((item) => item.tags)))

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#191A1E]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Market News</h1>
            <p className="text-gray-400 mt-2">Latest cryptocurrency news and market analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveNewsFeed />
            </div>
            <div>
              <NewsWidget />
            </div>
          </div>

          {!loading && (
            <div className="space-y-4 mt-8">
              {filteredNews.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight text-white">{item.title}</CardTitle>
                        <CardDescription className="mt-2 text-gray-400">{item.summary}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1 ${getSentimentColor(item.sentiment_score)}`}>
                          {getSentimentIcon(item.sentiment_score)}
                          <span className="text-sm font-medium text-white">
                            {(item.sentiment_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs text-white">
                          Impact: {(item.impact_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs text-white">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{item.source}</span>
                          <span>{formatTimeAgo(item.published_at)}</span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2 text-white" />
                            Read More
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredNews.length === 0 && (
            <Card className="mt-8">
              <CardContent className="text-center py-8 text-white">
                <p className="text-gray-400">No news found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
