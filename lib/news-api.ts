// News API integration utilities

export interface NewsSource {
  id: string;
  name: string;
  category: "crypto" | "stocks" | "economy";
  apiEndpoint: string;
  apiKey?: string;
}

export const newsSources: NewsSource[] = [
  {
    id: "cryptopanic",
    name: "CryptoPanic",
    category: "crypto",
    apiEndpoint: "https://cryptopanic.com/api/v1/posts/",
  },
  {
    id: "newsdata",
    name: "NewsData.io",
    category: "economy",
    apiEndpoint: "https://newsdata.io/api/1/news",
  },
  {
    id: "yahoo-finance",
    name: "Yahoo Finance",
    category: "stocks",
    apiEndpoint: "https://query1.finance.yahoo.com/v1/finance/search",
  },
];

export async function fetchCryptoNews() {
  try {
    // CryptoPanic API call
    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${process.env.CRYPTOPANIC_API_KEY}&public=true&kind=news`,
    );
    const data = await response.json();

    return (
      data.results?.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        summary: item.title, // CryptoPanic doesn't provide summaries
        source: item.source?.title || "CryptoPanic",
        category: "crypto" as const,
        publishedAt: item.published_at,
        url: item.url,
        sentiment: "neutral" as const, // Would be determined by AI analysis
      })) || []
    );
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return [];
  }
}

export async function fetchStockNews() {
  try {
    // NewsData.io API call for stock market news
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&category=business&q=stock%20market`,
    );
    const data = await response.json();

    return (
      data.results?.map((item: any) => ({
        id: item.article_id,
        title: item.title,
        summary: item.description || item.title,
        source: item.source_id,
        category: "stocks" as const,
        publishedAt: item.pubDate,
        url: item.link,
        sentiment: "neutral" as const,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching stock news:", error);
    return [];
  }
}

export async function fetchEconomyNews() {
  try {
    // NewsData.io API call for economy news
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&category=business&q=economy%20inflation%20fed`,
    );
    const data = await response.json();

    return (
      data.results?.map((item: any) => ({
        id: item.article_id,
        title: item.title,
        summary: item.description || item.title,
        source: item.source_id,
        category: "economy" as const,
        publishedAt: item.pubDate,
        url: item.link,
        sentiment: "neutral" as const,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching economy news:", error);
    return [];
  }
}

export async function analyzeNewsSentiment(articles: any[]) {
  try {
    // OpenAI API call for sentiment analysis
    const response = await fetch("/api/analyze-sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return articles;
  }
}
