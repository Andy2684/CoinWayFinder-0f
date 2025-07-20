"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { LiveNewsFeed } from "@/components/live-news-feed"
import { NewsWidget } from "@/components/news-widget"

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

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Crypto News</h1>
            <p className="text-gray-400">Stay updated with the latest cryptocurrency news and market insights</p>
          </div>
          <BackToDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
              <LiveNewsFeed articles={news} />
            )}
          </div>
          <div className="lg:col-span-1">
            <NewsWidget />
          </div>
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
      </div>
    </div>
  )
}
