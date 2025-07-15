// app/news/page.tsx
import { NextPage } from "next";
import React from "react";
import { getNews } from "@/lib/news"; // ваша функция получения новостей
import NewsFeed from "@/components/news/news-feed";

export const dynamic = "force-dynamic";

const NewsPage: NextPage = async () => {
  // Предположим, getNews() возвращает массив новостей
  const newsItems = await getNews();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Latest Crypto News</h1>
      <NewsFeed items={newsItems} />
    </main>
  );
};

export default NewsPage;
