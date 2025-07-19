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
  const [search, setSearch] = useState("")
  const [sentiment, setSentiment] = useState<string>("all") // Updated default value
  const [sortBy, setSortBy] = useState("date")

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (sentiment !== "all") params.append("sentiment", sentiment) // Updated condition
      if (sortBy) params.append("sortBy", sortBy)

      const response = await fetch(`/api/news?${params.toString()}`)
      const data: NewsResponse = await response.json()

      if (data.success) {
        setNews(data.data)
      } else {
        setError(data.error || "Failed to fetch news")
        // Use fallback data if available
        if (data.data) {
          setNews(data.data)
        }
      }
    } catch (err) {
      console.error("Fetch news error:", err)
      setError("Failed to fetch news")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [search, sentiment, sortBy])

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (score < -0.3) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-green-600 bg-green-50 border-green-200"
    if (score < -0.3) return "text-red-600 bg-red-50 border-red-200"
    return "text-yellow-600 bg-yellow-50 border-yellow-200"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1h ago"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1d ago"
    return `${diffInDays}d ago`
  }

  const clearFilters = () => {
    setSearch("")
    setSentiment("all") // Updated default value
    setSortBy("date")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Newspaper className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Crypto News</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
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
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sentiment} onValueChange={setSentiment}>
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
            <SelectItem value="date">Latest First</SelectItem>
            <SelectItem value="sentiment">Sentiment</SelectItem>
            <SelectItem value="impact">Impact Score</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>

        <Button variant="outline" onClick={fetchNews}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchNews} className="mt-2 bg-transparent" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {news.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No news articles found matching your criteria.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* News Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(article.sentiment_score)}
                  <Badge variant="outline" className={getSentimentColor(article.sentiment_score)}>
                    {article.sentiment_score > 0.3
                      ? "Positive"
                      : article.sentiment_score < -0.3
                        ? "Negative"
                        : "Neutral"}
                  </Badge>
                </div>
                <Badge variant="secondary">Impact: {article.impact_score}/10</Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{article.source}</span>
                <span>{formatTimeAgo(article.published_at)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-3">{article.summary}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read Full Article
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
