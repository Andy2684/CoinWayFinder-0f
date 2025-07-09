"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { CryptoNews } from "@/lib/crypto-api"

export function CryptoNewsFeed() {
  const [news, setNews] = useState<CryptoNews[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "positive" | "negative" | "neutral">("all")

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/crypto/news")
      const data = await response.json()

      if (data.success) {
        setNews(data.data)
      }
    } catch (error) {
      console.error("Error fetching crypto news:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "negative":
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredNews = news.filter((article) => selectedFilter === "all" || article.sentiment === selectedFilter)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Crypto News Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Crypto News Feed
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "positive" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("positive")}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Bullish
          </Button>
          <Button
            variant={selectedFilter === "negative" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("negative")}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            Bearish
          </Button>
          <Button
            variant={selectedFilter === "neutral" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("neutral")}
          >
            Neutral
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No news articles found</p>
              <p className="text-sm">Try adjusting your filter</p>
            </div>
          ) : (
            filteredNews.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {article.source}
                    </Badge>
                    <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                      <div className="flex items-center gap-1">
                        {getSentimentIcon(article.sentiment)}
                        {article.sentiment}
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(article.published_at)}
                  </div>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2 leading-tight">{article.title}</h3>

                {article.currencies.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {article.currencies.slice(0, 3).map((currency) => (
                      <Badge key={currency} variant="secondary" className="text-xs">
                        {currency}
                      </Badge>
                    ))}
                    {article.currencies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{article.currencies.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {article.summary && article.summary.length > 80
                      ? `${article.summary.substring(0, 80)}...`
                      : article.summary}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
