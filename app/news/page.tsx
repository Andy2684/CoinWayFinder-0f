"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink, Newspaper, RefreshCw } from "lucide-react"
import Link from "next/link"

interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  source: string
  sentiment: number
  impact: number
  timestamp: string
  url?: string
  tags: string[]
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState("desc")

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        search,
        sentiment: sentimentFilter,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/news?${params}`)
      const result = await response.json()

      if (result.success) {
        setNews(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch news")
      }
    } catch (err) {
      console.error("Error fetching news:", err)
      setError("Failed to load news. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [search, sentimentFilter, sortBy, sortOrder])

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (sentiment < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-yellow-500" />
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return "text-green-600 bg-green-50 border-green-200"
    if (sentiment < -0.2) return "text-red-600 bg-red-50 border-red-200"
    return "text-yellow-600 bg-yellow-50 border-yellow-200"
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1h ago"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  const clearFilters = () => {
    setSearch("")
    setSentimentFilter("all")
    setSortBy("timestamp")
    setSortOrder("desc")
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">News Feed</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchNews} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Crypto News Feed</h1>
        </div>
        <p className="text-muted-foreground">Stay updated with the latest cryptocurrency news and market insights</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Date</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(search || sentimentFilter !== "all" || sortBy !== "timestamp" || sortOrder !== "desc") && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* News Articles */}
      {!loading && (
        <>
          {news.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No news found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 leading-tight">{article.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{article.source}</span>
                          <span>{formatTimeAgo(article.timestamp)}</span>
                          <div className="flex items-center gap-1">
                            {getSentimentIcon(article.sentiment)}
                            <span>Impact: {article.impact}/10</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getSentimentColor(article.sentiment)} flex items-center gap-1`}
                      >
                        {getSentimentIcon(article.sentiment)}
                        {article.sentiment > 0.2 ? "Positive" : article.sentiment < -0.2 ? "Negative" : "Neutral"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{article.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {article.url && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={article.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Read More
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
