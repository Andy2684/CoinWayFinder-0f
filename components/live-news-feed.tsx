'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  ExternalLink,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Newspaper,
} from 'lucide-react'
import Link from 'next/link'

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  category: 'crypto' | 'stocks' | 'economy'
  publishedAt: string
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
  aiSummary?: string
  impact?: 'high' | 'medium' | 'low'
}

interface LiveNewsFeedProps {
  variant?: 'homepage' | 'full'
  limit?: number
}

export function LiveNewsFeed({ variant = 'full', limit }: LiveNewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])

  const mockArticles = useMemo<NewsArticle[]>(
    () => [
      {
        id: '1',
        title: 'Bitcoin hits $70k',
        summary: 'Bitcoin surged past $70,000 for the first time...',
        source: 'CoinDesk',
        category: 'crypto',
        publishedAt: new Date().toISOString(),
        url: 'https://coindesk.com/article1',
        sentiment: 'positive',
        impact: 'high',
      },
      {
        id: '2',
        title: 'Nasdaq falls 2% amid rate hike concerns',
        summary: 'Tech stocks led the decline on Monday...',
        source: 'Bloomberg',
        category: 'stocks',
        publishedAt: new Date().toISOString(),
        url: 'https://bloomberg.com/article2',
        sentiment: 'negative',
        impact: 'medium',
      },
    ],
    []
  )

  useEffect(() => {
    // временная заглушка, потом заменим на fetch с API
    setArticles(mockArticles)
  }, [mockArticles])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto':
        return 'text-green-500 border-green-500'
      case 'stocks':
        return 'text-blue-500 border-blue-500'
      case 'economy':
        return 'text-yellow-600 border-yellow-600'
      default:
        return 'text-gray-500 border-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      {articles.slice(0, limit ?? articles.length).map((article) => (
        <Card key={article.id} className="w-full">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{new Date(article.publishedAt).toLocaleString()}</span>
              </div>
              <span
                className={`
                  border px-2 py-1 text-xs rounded 
                  ${getCategoryColor(article.category)}
                `}
              >
                {article.category}
              </span>
            </div>

            <div className="text-lg font-semibold">{article.title}</div>
            <div className="text-sm text-muted-foreground">{article.summary}</div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href={article.url}
                className="text-blue-600 hover:underline flex items-center gap-1"
                target="_blank"
              >
                <ExternalLink size={14} />
                Читать источник ({article.source})
              </Link>
              <Badge variant="outline">{article.sentiment}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
