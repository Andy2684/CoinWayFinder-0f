"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, ExternalLink, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { CryptoNews } from "@/lib/crypto-api"

export function CryptoNewsFeed() {
  const [news, setNews] = useState<CryptoNews[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/crypto/news?limit=15")
      const data = await response.json()

      if (data.success) {
        setNews(data.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch crypto news:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 300000)
    return () => clearInterval(interval)
  }, [])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-3 h-3 text-green-400" />
      case "negative":
        return <TrendingDown className="w-3 h-3 text-red-400" />
      default:
        return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "negative":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Newspaper className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Crypto News Feed
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/10 text-blue-400">
              <Newspaper className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchNews} disabled={loading} className="h-8 w-8 p-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400">Latest crypto news • Last updated: {lastUpdate.toLocaleTimeString()}</p>
      </CardHeader>
      <CardContent>
        {loading && news.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-16 ml-4"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {news.map((article) => (
              <div
                key={article.id}
                className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-[#30D5C8]/50 transition-colors group cursor-pointer"
                onClick={() => window.open(article.url, "_blank")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <h4 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-[#30D5C8] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-2">{article.summary}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getSentimentColor(article.sentiment)}>
                      {getSentimentIcon(article.sentiment)}
                      <span className="ml-1 capitalize">{article.sentiment}</span>
                    </Badge>
                    {article.votes && (
                      <div className="text-xs text-gray-500">
                        👍 {article.votes.positive} 👎 {article.votes.negative}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{article.source}</span>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{getTimeAgo(article.published_at)}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {news.length === 0 && !loading && (
          <div className="text-center py-8">
            <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No news available</h3>
            <p className="text-gray-500">Check back later for the latest crypto news</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
