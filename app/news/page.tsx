"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, Newspaper, ExternalLink, RefreshCw } from "lucide-react"

interface NewsArticle {
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

interface NewsResponse {
  success: boolean
  data: NewsArticle[]
  total: number
  error?: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all") // Updated default value
  const [sortBy, setSortBy] = useState("date")
  const [retryCount, setRetryCount] = useState(0)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sentimentFilter !== "all") params.append("sentiment", sentimentFilter) // Updated condition
      if (sortBy) params.append("sortBy", sortBy)
      params.append("limit", "20")

      const response = await fetch(`/api/news?${params.toString()}`)
      const result: NewsResponse = await response.json()

      if (result.success) {
        setNews(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch news")
      }
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch news")
      // Use fallback data on error
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [searchTerm, sentimentFilter, sortBy])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchNews()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSentimentFilter("all") // Updated default value
    setSortBy("date")
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (score < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return "bg-green-100 text-green-800 border-green-200"
    if (score < -0.2) return "bg-red-100 text-red-800 border-red-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getImpactColor = (score: number) => {
    if (score >= 8) return "bg-red-100 text-red-800 border-red-200"
    if (score >= 6) return "bg-orange-100 text-orange-800 border-orange-200"
    if (score >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1h ago"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Newspaper className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Crypto News</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Newspaper className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Crypto News</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-48">
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Latest First</SelectItem>
            <SelectItem value="sentiment">Sentiment</SelectItem>
            <SelectItem value="impact">Impact Score</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || sentimentFilter !== "all" || sortBy !== "date") && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-5 w-5" />
                <span className="font-medium">Error loading news: {error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Articles */}
      {news.length === 0 && !loading && !error ? (
        <Card className="text-center py-12">
          <CardContent>
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || sentimentFilter !== "all" ? "Try adjusting your filters" : "No news articles available"}
            </p>
            {(searchTerm || sentimentFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {news.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 leading-tight">{article.title}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant="outline" className={getSentimentColor(article.sentiment_score)}>
                      {getSentimentIcon(article.sentiment_score)}
                      <span className="ml-1">
                        {article.sentiment_score > 0.2
                          ? "Positive"
                          : article.sentiment_score < -0.2
                            ? "Negative"
                            : "Neutral"}
                      </span>
                    </Badge>
                    <Badge variant="outline" className={getImpactColor(article.impact_score)}>
                      Impact: {article.impact_score}/10
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{article.source}</span>
                    <span>{formatTimeAgo(article.published_at)}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read More
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
