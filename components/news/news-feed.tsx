// components/news/news-feed.tsx
"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // TODO: подмените на fetch("/api/news") или реальный источник
    setNews([
      {
        id: "1",
        title: "Bitcoin Hits New All‑Time High",
        summary: "Bitcoin price surged past $70,000 amid renewed institutional interest.",
        publishedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Ethereum Shanghai Upgrade Deployed",
        summary: "Ethereum’s Shanghai upgrade went live, enabling withdrawals of staked ETH.",
        publishedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Crypto News</h1>
      <ul className="space-y-4">
        {news.map((item) => (
          <li key={item.id} className="border-b pb-4">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-500">{new Date(item.publishedAt).toLocaleString()}</p>
            <p className="mt-1">{item.summary}</p>
          </li>
        ))}
        {news.length === 0 && <li>No news available.</li>}
      </ul>
    </div>
  );
}
