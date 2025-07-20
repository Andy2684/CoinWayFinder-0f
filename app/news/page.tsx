"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, Clock, Tag, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { BackToDashboard } from "@/components/back-to-dashboard"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  source: string
  publishedAt: string
  sentiment: "positive" | "negative" | "neutral"
  impact: number
  tags: string[]
  imageUrl: string
}

interface NewsResponse {
  articles: NewsArticle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sentiment, setSentiment] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        search,
        sentiment,
        sortBy,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/news?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch news")
      }

      const data: NewsResponse = await response.json()
      setNews(data.articles)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      // Fallback to empty array on error
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [search, sentiment, sortBy, page])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
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

  const getImpactColor = (impact: number) => {
    if (impact >= 8) return "bg-red-100 text-red-800 border-red-200"
    if (impact >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const clearFilters = () => {
    setSearch("")
    setSentiment("all")
    setSortBy("date")
    setPage(1)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <BackToDashboard className="mb-6" />
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading News</h3>
                <p className="text-gray-600 text-center mb-4">{error}</p>
                <Button onClick={fetchNews}>Try Again</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <BackToDashboard />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Crypto News</h1>
            <p className="text-white/70">Stay updated with the latest cryptocurrency news and market insights</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search news..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={sentiment}
                onValueChange={(value) => {
                  setSentiment(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Latest First</SelectItem>
                  <SelectItem value="impact">Impact Score</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* News Articles */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : news.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No news found</h3>
              <p className="text-gray-600 text-center">
                Try adjusting your search terms or filters to find more articles.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={article.imageUrl || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={getSentimentColor(article.sentiment)}>
                        {getSentimentIcon(article.sentiment)}
                        <span className="ml-1 capitalize">{article.sentiment}</span>
                      </Badge>
                      <Badge variant="outline" className={getImpactColor(article.impact)}>
                        Impact: {article.impact}/10
                      </Badge>
                    </div>

                    <CardTitle className="text-lg mb-2 line-clamp-2">{article.title}</CardTitle>

                    <CardDescription className="mb-4 line-clamp-3">{article.summary}</CardDescription>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(article.publishedAt)}
                      </div>
                      <span>{article.source}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
