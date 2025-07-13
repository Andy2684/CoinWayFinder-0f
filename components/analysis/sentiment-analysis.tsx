"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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

  const fetchSentimentData = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`/api/analysis/sentiment?symbol=${selectedCrypto}`);

      // MOCK DATA
      setSentimentData([
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
      ]);

      setNewsItems([
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
      ]);

      setTrendingTopics([
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
      ]);

      setFearGreedIndex(Math.floor(Math.random() * 100));
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    fetchSentimentData();
  }, [fetchSentimentData]);

  const getSentimentColor = (val: number) =>
    val >= 70 ? "text-green-600" : val >= 40 ? "text-yellow-600" : "text-red-600";

  const getFearGreedColor = (index: number) =>
    index >= 75
      ? "text-red-600"
      : index >= 55
        ? "text-orange-600"
        : index >= 45
          ? "text-yellow-600"
          : index >= 25
            ? "text-blue-600"
            : "text-purple-600";

  const getFearGreedLabel = (index: number) =>
    index >= 75
      ? "Extreme Greed"
      : index >= 55
        ? "Greed"
        : index >= 45
          ? "Neutral"
          : index >= 25
            ? "Fear"
            : "Extreme Fear";

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
        <Button onClick={fetchSentimentData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Остальной интерфейс оставляем без изменений */}
      {/* Cards, Lists и Прогресс бары — работают как есть */}
    </div>
  );
}
