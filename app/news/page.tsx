"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink, Newspaper, Filter, X } from "lucide-react"
import Link from "next/link"

interface NewsArticle {
  id: number
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
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("published_at")
  const [sortOrder, setSortOrder] = useState("desc")

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchTerm) params.append("search", searchTerm)
      if (sentimentFilter !== "all") params.append("sentiment", sentimentFilter)
      params.append("sortBy", sortBy)
      params.append("sortOrder", sortOrder)

      const response = await fetch(`/api/news?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setNews(result.data)
        setError(null)
      } else {
        throw new Error(result.error || "Failed to fetch news")
      }
    } catch (err) {
      console.error("Get news error:", err)
      setError("Failed to load news articles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [searchTerm, sentimentFilter, sortBy, sortOrder])

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (score < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-yellow-500" />
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return "text-green-600 bg-green-50 border-green-200"
    if (score < -0.2) return "text-red-600 bg-red-50 border-red-200"
    return "text-yellow-600 bg-yellow-50 border-yellow-200"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const published = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSentimentFilter("all")
    setSortBy("published_at")
    setSortOrder("desc")
  }

  const hasActiveFilters = searchTerm || sentimentFilter !== "all" || sortBy !== "published_at" || sortOrder !== "desc"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Crypto News</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest cryptocurrency news, market analysis, and industry developments
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search News</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles, tags, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sentiment</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published_at">Date</SelectItem>
                  <SelectItem value="sentiment_score">Sentiment</SelectItem>
                  <SelectItem value="impact_score">Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12">
            <CardContent>
              <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to Load News</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <Button onClick={fetchNews}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!loading && !error && news.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Articles Found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Try adjusting your search terms or filters</p>
              {hasActiveFilters && <Button onClick={clearFilters}>Clear Filters</Button>}
            </CardContent>
          </Card>
        )}

        {/* News Grid */}
        {!loading && !error && news.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.source}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatTimeAgo(article.published_at)}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{article.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{article.summary}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(article.sentiment_score)}
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getSentimentColor(article.sentiment_score)}`}
                      >
                        {article.sentiment_score > 0.2
                          ? "Positive"
                          : article.sentiment_score < -0.2
                            ? "Negative"
                            : "Neutral"}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Impact: {article.impact_score}/10
                    </Badge>
                  </div>

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

                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Read full article
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
