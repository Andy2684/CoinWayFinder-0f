"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink, Newspaper } from "lucide-react"

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

interface NewsResponse {
  success: boolean
  data: NewsArticle[]
  total: number
  note?: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("published_at")

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        sentiment: sentimentFilter,
        sortBy: sortBy,
      })

      const response = await fetch(`/api/news?${params}`)
      const data: NewsResponse = await response.json()

      if (data.success) {
        setNews(data.data)
        setError(null)
      } else {
        setError("Failed to fetch news")
      }
    } catch (err) {
      setError("Failed to fetch news")
      console.error("News fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [searchTerm, sentimentFilter, sortBy])

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (score < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return "bg-green-100 text-green-800"
    if (score < -0.2) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const getImpactColor = (score: number) => {
    if (score >= 8) return "bg-red-100 text-red-800"
    if (score >= 6) return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))

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
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Newspaper className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Crypto News</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
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
        <Newspaper className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Crypto News</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published_at">Latest</SelectItem>
            <SelectItem value="sentiment_score">Sentiment</SelectItem>
            <SelectItem value="impact_score">Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchNews} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {news.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No news found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* News Articles */}
      <div className="grid gap-6">
        {news.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 leading-tight">{article.title}</CardTitle>
                  <CardDescription className="text-base">{article.summary}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(article.sentiment_score)}
                    <Badge className={getSentimentColor(article.sentiment_score)}>
                      {article.sentiment_score > 0.2
                        ? "Positive"
                        : article.sentiment_score < -0.2
                          ? "Negative"
                          : "Neutral"}
                    </Badge>
                  </div>
                  <Badge className={getImpactColor(article.impact_score)}>Impact: {article.impact_score}/10</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3">{article.content}</p>

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
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    Read more
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
