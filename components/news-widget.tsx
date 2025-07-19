import React from "react"

interface NewsItem {
  title: string
  url: string
}

interface Props {
  news: NewsItem[]
}

export const NewsWidget: React.FC<Props> = ({ news }) => {
  return (
    <div className="space-y-2">
      {news.map((item) => (
        <a key={item.url} href={item.url} className="block text-sm hover:underline">
          {item.title}
        </a>
      ))}
    </div>
  )
}
