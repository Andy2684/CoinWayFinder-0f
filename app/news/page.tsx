"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"

interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  publishedAt: string
  sentiment: number
  category: string
  image: string
  url: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNews()
  }, [selectedCategory])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/news?category=${selectedCategory}&limit=20`)
      const data = await response.json()
      setNews(data.news)
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.3) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <TrendingUp className="mr-1 h-3 w-3" />
          Bullish
        </Badge>
      )
    } else if (sentiment < -0.3) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <TrendingDown className="mr-1 h-3 w-3" />
          Bearish
        </Badge>
      )
    }
    return <Badge variant="secondary">Neutral</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Crypto News & Analysis</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest cryptocurrency news and AI-powered sentiment analysis
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={fetchNews} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="defi">DeFi</TabsTrigger>
          <TabsTrigger value="regulation">Regulation</TabsTrigger>
          <TabsTrigger value="exchange">Exchanges</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=400&text=News"
                      }}
                    />
                    <div className="absolute top-2 right-2">{getSentimentBadge(item.sentiment)}</div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.source}</span>
                      <span>{format(new Date(item.publishedAt), "MMM dd, HH:mm")}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
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

          {!loading && filteredNews.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No news found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm
                    ? `No news articles match "${searchTerm}"`
                    : `No news available for ${selectedCategory === "all" ? "any category" : selectedCategory}`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
