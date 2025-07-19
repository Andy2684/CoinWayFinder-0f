"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, Clock, User, Tag, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  author: string
  publishedAt: string
  imageUrl: string
  tags: string[]
  sentiment: "positive" | "negative" | "neutral"
  impactScore: number
  source: string
  category: string
}

interface NewsResponse {
  success: boolean
  data: NewsArticle[]
  total: number
  hasMore: boolean
  error?: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [hasMore, setHasMore] = useState(true)

  const fetchNews = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        search: searchTerm,
        sentiment: sentimentFilter,
        sortBy: sortBy,
        limit: "10",
        offset: reset ? "0" : articles.length.toString(),
      })

      const response = await fetch(`/api/news?${params}`)
      const data: NewsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch news")
      }

      if (reset) {
        setArticles(data.data)
      } else {
        setArticles((prev) => [...prev, ...data.data])
      }

      setHasMore(data.hasMore)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch news"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews(true)
  }, [searchTerm, sentimentFilter, sortBy])

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
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

  const clearFilters = () => {
    setSearchTerm("")
    setSentimentFilter("all")
    setSortBy("date")
  }

  const retryFetch = () => {
    fetchNews(true)
  }

  if (error && articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load News</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={retryFetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crypto News</h1>
        <p className="text-gray-600">Stay updated with the latest cryptocurrency and blockchain news</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
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
        {(searchTerm || sentimentFilter !== "all" || sortBy !== "date") && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
        )}
      </div>

      {/* News Articles */}
      <div className="space-y-6">
        {articles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 line-clamp-2">{article.title}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.summary}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(article.publishedAt)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {article.source}
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={article.imageUrl || "/placeholder.svg"}
                    alt={article.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getSentimentColor(article.sentiment)} flex items-center gap-1`}>
                    {getSentimentIcon(article.sentiment)}
                    {article.sentiment}
                  </Badge>
                  <Badge className={`${getImpactColor(article.impactScore)}`}>Impact: {article.impactScore}/10</Badge>
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Tag className="h-3 w-3 text-gray-400" />
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
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center py-6">
            <Button onClick={() => fetchNews(false)} variant="outline">
              Load More Articles
            </Button>
          </div>
        )}

        {/* No Results */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
