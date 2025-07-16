// components/news/news-feed.tsx
'use client'

import { NewsItem } from '@/lib/news'

interface NewsFeedProps {
  items: NewsItem[]
}

export default function NewsFeed({ items }: NewsFeedProps) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {item.title}
          </a>
          <div className="text-xs text-gray-500">{new Date(item.publishedAt).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  )
}
