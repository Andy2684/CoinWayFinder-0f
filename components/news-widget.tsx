'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface NewsWidgetProps {
  className?: string
}

export function NewsWidget({ className }: NewsWidgetProps) {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news?limit=5')
      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()

    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchNews, 180000)
    return () => clearInterval(interval)
  }, [])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-3 h-3 text-red-500" />
      default:
        return <Minus className="w-3 h-3 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto':
        return 'bg-[#30D5C8]/10 text-[#30D5C8]'
      case 'stocks':
        return 'bg-blue-500/10 text-blue-400'
      case 'economy':
        return 'bg-orange-500/10 text-orange-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            📢 Market News
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNews}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.slice(0, 3).map((article) => (
              <div
                key={article.id}
                className="border-b border-gray-800 last:border-b-0 pb-3 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                    {article.category.toUpperCase()}
                  </Badge>
                  {getSentimentIcon(article.sentiment)}
                </div>

                <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 hover:text-[#30D5C8] transition-colors cursor-pointer">
                  {article.title}
                </h4>

                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{article.summary}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{article.source}</span>
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(article.publishedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))}

            <Link href="/news">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                View All News
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
