"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Twitter,
  RefreshCw,
} from "lucide-react";

interface SentimentData {
  platform: string;
  sentiment: number;
  volume: number;
  change24h: number;
  icon: React.ReactNode;
}

interface NewsItem {
  title: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  source: string;
  timestamp: string;
}

interface TrendingTopic {
  topic: string;
  mentions: number;
  sentiment: number;
  change: number;
}

export function SentimentAnalysis() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [fearGreedIndex, setFearGreedIndex] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);

  const cryptos = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "ADA", label: "Cardano (ADA)" },
    { value: "SOL", label: "Solana (SOL)" },
    { value: "DOT", label: "Polkadot (DOT)" },
  ];

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analysis/sentiment?symbol=${selectedCrypto}`,
      );

      // Mock data for demonstration
      const mockSentimentData: SentimentData[] = [
        {
          platform: "Twitter",
          sentiment: 72,
          volume: 15420,
          change24h: 8.5,
          icon: <Twitter className="h-4 w-4" />,
        },
        {
          platform: "Reddit",
          sentiment: 68,
          volume: 8930,
          change24h: -2.1,
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          platform: "Telegram",
          sentiment: 75,
          volume: 12340,
          change24h: 12.3,
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          platform: "Discord",
          sentiment: 65,
          volume: 5670,
          change24h: -5.2,
          icon: <MessageCircle className="h-4 w-4" />,
        },
      ];

      const mockNews: NewsItem[] = [
        {
          title: "Bitcoin ETF Sees Record Inflows This Week",
          sentiment: "positive",
          score: 0.85,
          source: "CoinDesk",
          timestamp: "2 hours ago",
        },
        {
          title: "Regulatory Concerns Impact Crypto Market",
          sentiment: "negative",
          score: -0.62,
          source: "Bloomberg",
          timestamp: "4 hours ago",
        },
        {
          title: "Major Exchange Announces New Features",
          sentiment: "positive",
          score: 0.73,
          source: "CryptoNews",
          timestamp: "6 hours ago",
        },
        {
          title: "Market Analysis: Consolidation Phase Expected",
          sentiment: "neutral",
          score: 0.12,
          source: "TradingView",
          timestamp: "8 hours ago",
        },
      ];

      const mockTrending: TrendingTopic[] = [
        { topic: "Bitcoin ETF", mentions: 2340, sentiment: 78, change: 15.2 },
        { topic: "DeFi Protocol", mentions: 1890, sentiment: 65, change: -3.4 },
        {
          topic: "Layer 2 Solutions",
          mentions: 1560,
          sentiment: 82,
          change: 22.1,
        },
        {
          topic: "NFT Marketplace",
          mentions: 1230,
          sentiment: 58,
          change: -8.7,
        },
        { topic: "Staking Rewards", mentions: 980, sentiment: 71, change: 5.3 },
      ];

      setSentimentData(mockSentimentData);
      setFearGreedIndex(Math.floor(Math.random() * 100));
      setNewsItems(mockNews);
      setTrendingTopics(mockTrending);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();
  }, [selectedCrypto]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "text-green-600";
    if (sentiment >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment >= 70) return "bg-green-100";
    if (sentiment >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getFearGreedLabel = (index: number) => {
    if (index >= 75) return "Extreme Greed";
    if (index >= 55) return "Greed";
    if (index >= 45) return "Neutral";
    if (index >= 25) return "Fear";
    return "Extreme Fear";
  };

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return "text-red-600";
    if (index >= 55) return "text-orange-600";
    if (index >= 45) return "text-yellow-600";
    if (index >= 25) return "text-blue-600";
    return "text-purple-600";
  };

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select cryptocurrency" />
          </SelectTrigger>
          <SelectContent>
            {cryptos.map((crypto) => (
              <SelectItem key={crypto.value} value={crypto.value}>
                {crypto.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={fetchSentimentData}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fear & Greed Index</CardTitle>
            <CardDescription>
              Overall market sentiment indicator
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative">
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: getFearGreedColor(fearGreedIndex).replace(
                      "text-",
                      "border-",
                    ),
                    transform: `rotate(${(fearGreedIndex / 100) * 360}deg)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{fearGreedIndex}</div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`text-lg font-semibold ${getFearGreedColor(fearGreedIndex)}`}
            >
              {getFearGreedLabel(fearGreedIndex)}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Social Sentiment by Platform</CardTitle>
            <CardDescription>
              Sentiment analysis across social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {data.icon}
                    <div>
                      <div className="font-medium">{data.platform}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.volume.toLocaleString()} mentions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-semibold ${getSentimentColor(data.sentiment)}`}
                    >
                      {data.sentiment}%
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${
                        data.change24h >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {data.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(data.change24h)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent News Sentiment</CardTitle>
            <CardDescription>
              Sentiment analysis of recent crypto news
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newsItems.map((news, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2">{news.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.timestamp}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      news.sentiment === "positive"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : news.sentiment === "negative"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {news.sentiment}
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress
                    value={Math.abs(news.score) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Score: {news.score.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trending Topics</CardTitle>
            <CardDescription>
              Most discussed topics in crypto community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{topic.topic}</div>
                  <div className="text-sm text-muted-foreground">
                    {topic.mentions.toLocaleString()} mentions
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${getSentimentColor(topic.sentiment)}`}
                  >
                    {topic.sentiment}%
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      topic.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {topic.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(topic.change)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
