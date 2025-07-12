"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, DollarSign, Activity, RefreshCw } from "lucide-react";

interface MarketOverview {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  volumeChange24h: number;
}

interface SectorData {
  name: string;
  marketCap: number;
  change24h: number;
  dominance: number;
  topCoins: string[];
}

interface CorrelationData {
  asset1: string;
  asset2: string;
  correlation: number;
}

interface DominanceData {
  date: string;
  btc: number;
  eth: number;
  others: number;
}

export function MarketAnalysis() {
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(
    null,
  );
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [dominanceData, setDominanceData] = useState<DominanceData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [loading, setLoading] = useState(false);

  const timeframes = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
  ];

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockOverview: MarketOverview = {
        totalMarketCap: 1650000000000,
        totalVolume: 45000000000,
        btcDominance: 52.3,
        ethDominance: 17.8,
        marketCapChange24h: 2.4,
        volumeChange24h: -8.2,
      };

      const mockSectors: SectorData[] = [
        {
          name: "Layer 1",
          marketCap: 850000000000,
          change24h: 3.2,
          dominance: 51.5,
          topCoins: ["BTC", "ETH", "ADA", "SOL", "AVAX"],
        },
        {
          name: "DeFi",
          marketCap: 120000000000,
          change24h: -1.8,
          dominance: 7.3,
          topCoins: ["UNI", "AAVE", "COMP", "MKR", "SNX"],
        },
        {
          name: "Layer 2",
          marketCap: 85000000000,
          change24h: 5.7,
          dominance: 5.2,
          topCoins: ["MATIC", "OP", "ARB", "LRC", "IMX"],
        },
        {
          name: "NFT & Gaming",
          marketCap: 45000000000,
          change24h: -3.4,
          dominance: 2.7,
          topCoins: ["AXS", "SAND", "MANA", "ENJ", "FLOW"],
        },
        {
          name: "Meme Coins",
          marketCap: 35000000000,
          change24h: 12.8,
          dominance: 2.1,
          topCoins: ["DOGE", "SHIB", "PEPE", "FLOKI", "BONK"],
        },
      ];

      const mockCorrelations: CorrelationData[] = [
        { asset1: "BTC", asset2: "ETH", correlation: 0.85 },
        { asset1: "BTC", asset2: "ADA", correlation: 0.72 },
        { asset1: "BTC", asset2: "SOL", correlation: 0.68 },
        { asset1: "ETH", asset2: "ADA", correlation: 0.79 },
        { asset1: "ETH", asset2: "SOL", correlation: 0.74 },
        { asset1: "ADA", asset2: "SOL", correlation: 0.71 },
      ];

      const mockDominance: DominanceData[] = Array.from(
        { length: 30 },
        (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          btc: 50 + Math.random() * 8,
          eth: 16 + Math.random() * 4,
          others: 30 + Math.random() * 8,
        }),
      );

      setMarketOverview(mockOverview);
      setSectorData(mockSectors);
      setCorrelationData(mockCorrelations);
      setDominanceData(mockDominance);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [selectedTimeframe]);

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 0.8) return "bg-red-100 text-red-800";
    if (correlation >= 0.6) return "bg-yellow-100 text-yellow-800";
    if (correlation >= 0.4) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (!marketOverview) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive cryptocurrency market overview
          </p>
        </div>
        <div className="flex gap-4">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((timeframe) => (
                <SelectItem key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={fetchMarketData}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Market Cap
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMarketCap(marketOverview.totalMarketCap)}
            </div>
            <p
              className={`text-xs ${getChangeColor(marketOverview.marketCapChange24h)}`}
            >
              {marketOverview.marketCapChange24h >= 0 ? "+" : ""}
              {marketOverview.marketCapChange24h.toFixed(2)}% (24h)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMarketCap(marketOverview.totalVolume)}
            </div>
            <p
              className={`text-xs ${getChangeColor(marketOverview.volumeChange24h)}`}
            >
              {marketOverview.volumeChange24h >= 0 ? "+" : ""}
              {marketOverview.volumeChange24h.toFixed(2)}% (24h)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketOverview.btcDominance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Bitcoin market share
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH Dominance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketOverview.ethDominance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Ethereum market share
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Dominance Over Time</CardTitle>
            <CardDescription>BTC and ETH dominance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dominanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}%`,
                      name.toUpperCase(),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="btc"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="BTC"
                  />
                  <Line
                    type="monotone"
                    dataKey="eth"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="ETH"
                  />
                  <Line
                    type="monotone"
                    dataKey="others"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Others"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
            <CardDescription>Performance by crypto sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)}%`,
                      "24h Change",
                    ]}
                  />
                  <Bar dataKey="change24h" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sector Breakdown</CardTitle>
            <CardDescription>Market cap distribution by sector</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorData.map((sector, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full`}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <div className="font-medium">{sector.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {sector.topCoins.slice(0, 3).join(", ")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatMarketCap(sector.marketCap)}
                  </div>
                  <div
                    className={`text-sm ${getChangeColor(sector.change24h)}`}
                  >
                    {sector.change24h >= 0 ? "+" : ""}
                    {sector.change24h.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {sector.dominance.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Correlations</CardTitle>
            <CardDescription>
              Correlation matrix between major cryptocurrencies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {correlationData.map((correlation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="font-medium">
                  {correlation.asset1} vs {correlation.asset2}
                </div>
                <Badge
                  variant="outline"
                  className={getCorrelationColor(correlation.correlation)}
                >
                  {correlation.correlation.toFixed(2)}
                </Badge>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-4">
              <p>
                Correlation ranges from -1 (inverse) to +1 (perfect correlation)
              </p>
              <p>Values above 0.8 indicate high correlation</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
