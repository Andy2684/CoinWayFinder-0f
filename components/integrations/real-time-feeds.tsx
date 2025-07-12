"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: string;
  exchange: string;
}

interface OrderBookData {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  spread: number;
  exchange: string;
}

interface TradeData {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: "buy" | "sell";
  timestamp: string;
  exchange: string;
}

export function RealTimeFeeds() {
  const [isConnected, setIsConnected] = useState(true);
  const [activeFeeds, setActiveFeeds] = useState({
    prices: true,
    orderbook: true,
    trades: false,
    klines: false,
  });

  const [priceData, setPriceData] = useState<PriceData[]>([
    {
      symbol: "BTCUSDT",
      price: 42890.5,
      change24h: 2.1,
      volume24h: 28450000,
      lastUpdate: "Just now",
      exchange: "Binance",
    },
    {
      symbol: "ETHUSDT",
      price: 2298.75,
      change24h: -1.2,
      volume24h: 15230000,
      lastUpdate: "Just now",
      exchange: "Binance",
    },
    {
      symbol: "BNBUSDT",
      price: 310.2,
      change24h: 3.4,
      volume24h: 890000,
      lastUpdate: "Just now",
      exchange: "Binance",
    },
    {
      symbol: "BTCUSDT",
      price: 42885.25,
      change24h: 2.0,
      volume24h: 12340000,
      lastUpdate: "Just now",
      exchange: "Bybit",
    },
    {
      symbol: "ETHUSDT",
      price: 2299.1,
      change24h: -1.1,
      volume24h: 8920000,
      lastUpdate: "Just now",
      exchange: "Bybit",
    },
    {
      symbol: "SOLUSDT",
      price: 99.95,
      change24h: -3.2,
      volume24h: 5670000,
      lastUpdate: "Just now",
      exchange: "Bybit",
    },
  ]);

  const [orderBookData, setOrderBookData] = useState<OrderBookData[]>([
    {
      symbol: "BTCUSDT",
      bids: [
        [42890.5, 0.5234],
        [42889.25, 1.2345],
        [42888.0, 0.8901],
        [42887.75, 2.1234],
        [42886.5, 0.6789],
      ],
      asks: [
        [42891.25, 0.789],
        [42892.5, 1.4567],
        [42893.75, 0.9876],
        [42895.0, 1.8901],
        [42896.25, 0.5432],
      ],
      spread: 0.75,
      exchange: "Binance",
    },
    {
      symbol: "ETHUSDT",
      bids: [
        [2298.75, 8.234],
        [2298.5, 12.567],
        [2298.25, 6.789],
        [2298.0, 15.432],
        [2297.75, 9.876],
      ],
      asks: [
        [2299.0, 7.654],
        [2299.25, 11.234],
        [2299.5, 5.678],
        [2299.75, 13.901],
        [2300.0, 8.345],
      ],
      spread: 0.25,
      exchange: "Binance",
    },
  ]);

  const [recentTrades, setRecentTrades] = useState<TradeData[]>([
    {
      id: "1",
      symbol: "BTCUSDT",
      price: 42890.5,
      quantity: 0.1234,
      side: "buy",
      timestamp: "14:32:15",
      exchange: "Binance",
    },
    {
      id: "2",
      symbol: "BTCUSDT",
      price: 42889.25,
      quantity: 0.5678,
      side: "sell",
      timestamp: "14:32:14",
      exchange: "Binance",
    },
    {
      id: "3",
      symbol: "ETHUSDT",
      price: 2298.75,
      quantity: 2.3456,
      side: "buy",
      timestamp: "14:32:13",
      exchange: "Binance",
    },
    {
      id: "4",
      symbol: "BTCUSDT",
      price: 42885.25,
      quantity: 0.2345,
      side: "buy",
      timestamp: "14:32:12",
      exchange: "Bybit",
    },
    {
      id: "5",
      symbol: "ETHUSDT",
      price: 2299.1,
      quantity: 1.789,
      side: "sell",
      timestamp: "14:32:11",
      exchange: "Bybit",
    },
  ]);

  const [connectionStatus, setConnectionStatus] = useState({
    binance: "connected",
    bybit: "connected",
    kucoin: "disconnected",
    okx: "connecting",
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Update prices
      setPriceData((prev) =>
        prev.map((item) => ({
          ...item,
          price: item.price + (Math.random() - 0.5) * 10,
          change24h: item.change24h + (Math.random() - 0.5) * 0.5,
          lastUpdate: "Just now",
        })),
      );

      // Add new trades
      const newTrade: TradeData = {
        id: Date.now().toString(),
        symbol: ["BTCUSDT", "ETHUSDT"][Math.floor(Math.random() * 2)],
        price: 42890 + (Math.random() - 0.5) * 100,
        quantity: Math.random() * 2,
        side: Math.random() > 0.5 ? "buy" : "sell",
        timestamp: new Date().toLocaleTimeString(),
        exchange: ["Binance", "Bybit"][Math.floor(Math.random() * 2)],
      };

      setRecentTrades((prev) => [newTrade, ...prev.slice(0, 19)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  const toggleFeed = (feedType: keyof typeof activeFeeds) => {
    setActiveFeeds((prev) => ({ ...prev, [feedType]: !prev[feedType] }));
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "connecting":
        return <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case "disconnected":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">
                📡 Real-Time Data Feeds
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Live market data from connected exchanges
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <span
                  className={`text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <Button
                onClick={toggleConnection}
                variant={isConnected ? "destructive" : "default"}
                className={
                  isConnected
                    ? ""
                    : "bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                }
              >
                {isConnected ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(connectionStatus).map(([exchange, status]) => (
              <div key={exchange} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium capitalize">
                    {exchange}
                  </span>
                  {getConnectionIcon(status)}
                </div>
                <Badge
                  className={
                    status === "connected"
                      ? "bg-green-500/10 text-green-400"
                      : status === "connecting"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feed Controls */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">⚙️ Feed Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(activeFeeds).map(([feedType, isActive]) => (
              <div
                key={feedType}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium capitalize">
                    {feedType}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {feedType === "prices" && "Live price updates"}
                    {feedType === "orderbook" && "Order book depth"}
                    {feedType === "trades" && "Recent trades"}
                    {feedType === "klines" && "Candlestick data"}
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={() =>
                    toggleFeed(feedType as keyof typeof activeFeeds)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Data Tabs */}
      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="bg-gray-900/50 border-gray-800">
          <TabsTrigger
            value="prices"
            className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
          >
            💰 Prices
          </TabsTrigger>
          <TabsTrigger
            value="orderbook"
            className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
          >
            📊 Order Book
          </TabsTrigger>
          <TabsTrigger
            value="trades"
            className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
          >
            🔄 Recent Trades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Live Price Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium py-3">
                        Symbol
                      </th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3">
                        Exchange
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        Price
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        24h Change
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        Volume
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        Last Update
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.map((item, index) => (
                      <tr
                        key={`${item.exchange}-${item.symbol}`}
                        className="border-b border-gray-800/50"
                      >
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white font-medium">
                              {item.symbol}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                          >
                            {item.exchange}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-white font-mono">
                          ${item.price.toFixed(2)}
                        </td>
                        <td
                          className={`py-3 text-right ${item.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          <div className="flex items-center justify-end space-x-1">
                            {item.change24h >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>
                              {item.change24h >= 0 ? "+" : ""}
                              {item.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-white">
                          ${(item.volume24h / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-3 text-right text-gray-400 text-sm">
                          {item.lastUpdate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orderbook" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orderBookData.map((orderbook) => (
              <Card
                key={`${orderbook.exchange}-${orderbook.symbol}`}
                className="bg-gray-900/50 border-gray-800"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      {orderbook.symbol}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      {orderbook.exchange}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    Spread: ${orderbook.spread.toFixed(2)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Asks */}
                    <div>
                      <h4 className="text-red-400 text-sm font-medium mb-2">
                        Asks (Sell Orders)
                      </h4>
                      <div className="space-y-1">
                        {orderbook.asks
                          .slice()
                          .reverse()
                          .map(([price, quantity], index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-red-400 font-mono">
                                ${price.toFixed(2)}
                              </span>
                              <span className="text-gray-300">
                                {quantity.toFixed(4)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Bids */}
                    <div>
                      <h4 className="text-green-400 text-sm font-medium mb-2">
                        Bids (Buy Orders)
                      </h4>
                      <div className="space-y-1">
                        {orderbook.bids.map(([price, quantity], index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-green-400 font-mono">
                              ${price.toFixed(2)}
                            </span>
                            <span className="text-gray-300">
                              {quantity.toFixed(4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium py-3">
                        Time
                      </th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3">
                        Symbol
                      </th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3">
                        Exchange
                      </th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3">
                        Side
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        Price
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        Quantity
                      </th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-b border-gray-800/50"
                      >
                        <td className="py-3 text-gray-300 text-sm font-mono">
                          {trade.timestamp}
                        </td>
                        <td className="py-3 text-white font-medium">
                          {trade.symbol}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className="border-gray-600 text-gray-300 text-xs"
                          >
                            {trade.exchange}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            className={
                              trade.side === "buy"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }
                          >
                            {trade.side.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-white font-mono">
                          ${trade.price.toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-white">
                          {trade.quantity.toFixed(4)}
                        </td>
                        <td className="py-3 text-right text-white">
                          ${(trade.price * trade.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
