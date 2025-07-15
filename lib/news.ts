// lib/news.ts
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
}

export async function getNews(): Promise<NewsItem[]> {
  // Здесь можно вызывать ваш реальный API.
  // Пока что возвращаем статичный список.
  return [
    {
      id: "1",
      title: "Bitcoin hits new all‑time high",
      url: "https://example.com/bitcoin-high",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Ethereum 2.0 launch date revealed",
      url: "https://example.com/eth2-launch",
      publishedAt: new Date().toISOString(),
    },
  ];
}
