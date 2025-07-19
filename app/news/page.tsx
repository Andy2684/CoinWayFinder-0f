"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Filter, X } from "lucide-react"
import { toast } from "sonner"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  source: string
  author: string
  published_at: string
  url: string
  image_url: string
  sentiment: "positive" | "negative" | "neutral"
  impact_score: number
  tags: string[]
}

interface NewsResponse {
  success: boolean
  data: NewsArticle[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [hasFilters, setHasFilters] = useState(false)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: "20",
        offset: "0",
        sortBy,
      })

      if (searchTerm) params.append("search", searchTerm)
      if (sentimentFilter !== "all") params.append("sentiment", sentimentFilter)

      const response = await fetch(`/api/news?${params}`)
      const data: NewsResponse = await response.json()

      if (data.success) {
        setArticles(data.data)
      } else {
        throw new Error("Failed to fetch news")
      }
    } catch (err) {
      setError("Failed to load news articles")
      toast.error("Failed to load news articles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    setHasFilters(searchTerm !== "" || sentimentFilter !== "all" || sortBy !== "date")
  }, [searchTerm, sentimentFilter, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setSentimentFilter("all")
    setSortBy("date")
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
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

  const getImpactColor = (score: number) => {
    if (score >= 8) return "bg-red-100 text-red-800 border-red-200"
    if (score >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const published = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Crypto News</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchNews} variant="outline">
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
        <h1 className="text-3xl font-bold mb-2">Crypto News</h1>
        <p className="text-gray-600">Stay updated with the latest cryptocurrency and blockchain news</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectItem value="impact">Impact Score</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters active</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No news articles found</p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={article.image_url || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`${getImpactColor(article.impact_score)} border`}>
                    Impact: {article.impact_score}/10
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(article.sentiment)}
                    <Badge className={`${getSentimentColor(article.sentiment)} border capitalize`}>
                      {article.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(article.published_at)}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">{article.title}</CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.summary}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{article.source}</span>
                    <span className="mx-1">•</span>
                    <span>{article.author}</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
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
