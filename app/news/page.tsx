"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      console.error("Get news error:", err)
      setError("Failed to fetch news")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [search, sentiment, sortBy])

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
    if (score >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Newspaper className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Crypto News</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap bg-transparent">
          Clear Filters
        </Button>

        <Button variant="outline" onClick={fetchNews} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <TrendingDown className="h-5 w-5" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchNews} className="ml-auto bg-transparent">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* News Grid */}
      {!loading && news.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(article.sentiment_score)}
                    <Badge variant="outline" className={getSentimentColor(article.sentiment_score)}>
                      {article.sentiment_score > 0.2
                        ? "Positive"
                        : article.sentiment_score < -0.2
                          ? "Negative"
                          : "Neutral"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getImpactColor(article.impact_score)}>
                      Impact: {article.impact_score}/10
                    </Badge>
                    <span className="text-sm text-gray-500">{formatTimeAgo(article.published_at)}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{article.source}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{article.summary}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
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
      )}

      {/* No Results */}
      {!loading && news.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No news found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters to find more articles.</p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
