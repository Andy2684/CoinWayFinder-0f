"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Settings,
  TestTube,
} from "lucide-react";

interface PaperAccount {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  totalPnL: number;
  totalPnLPercentage: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  createdAt: string;
  isActive: boolean;
}

interface PaperPosition {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  entryTime: string;
  strategy: string;
  stopLoss?: number;
  takeProfit?: number;
}

interface PaperTrade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercentage: number;
  fees: number;
  entryTime: string;
  exitTime: string;
  strategy: string;
  duration: string;
}

export function PaperTradingDashboard() {
  const [paperAccount, setPaperAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState("all");

  useEffect(() => {
    // Initialize mock paper trading account
    const mockAccount: PaperAccount = {
      id: "paper_1",
      name: "Strategy Testing Account",
      initialBalance: 10000,
      currentBalance: 11250,
      totalPnL: 1250,
      totalPnLPercentage: 12.5,
      totalTrades: 45,
      winningTrades: 28,
      losingTrades: 17,
      winRate: 62.2,
      maxDrawdown: -8.5,
      sharpeRatio: 1.85,
      createdAt: "2024-01-01T00:00:00Z",
      isActive: true,
    };

    const mockPositions: PaperPosition[] = [
      {
        id: "pos_1",
        symbol: "BTC/USDT",
        side: "LONG",
        entryPrice: 43250,
        currentPrice: 44120,
        quantity: 0.1,
        unrealizedPnL: 87,
        unrealizedPnLPercentage: 2.01,
        entryTime: "2024-01-15T10:30:00Z",
        strategy: "RSI Divergence",
        stopLoss: 41900,
        takeProfit: 45800,
      },
      {
        id: "pos_2",
        symbol: "ETH/USDT",
        side: "SHORT",
        entryPrice: 2580,
        currentPrice: 2510,
        quantity: 2.5,
        unrealizedPnL: 175,
        unrealizedPnLPercentage: 2.71,
        entryTime: "2024-01-15T09:15:00Z",
        strategy: "MACD Crossover",
        stopLoss: 2650,
        takeProfit: 2420,
      },
      {
        id: "pos_3",
        symbol: "SOL/USDT",
        side: "LONG",
        entryPrice: 98.5,
        currentPrice: 96.2,
        quantity: 10,
        unrealizedPnL: -23,
        unrealizedPnLPercentage: -2.33,
        entryTime: "2024-01-15T11:45:00Z",
        strategy: "AI Pattern",
        stopLoss: 95.8,
        takeProfit: 105.2,
      },
    ];

    const mockTrades: PaperTrade[] = [
      {
        id: "trade_1",
        symbol: "BTC/USDT",
        side: "BUY",
        entryPrice: 42800,
        exitPrice: 44200,
        quantity: 0.15,
        pnl: 210,
        pnlPercentage: 3.27,
        fees: 6.42,
        entryTime: "2024-01-14T14:20:00Z",
        exitTime: "2024-01-14T18:45:00Z",
        strategy: "Bollinger Squeeze",
        duration: "4h 25m",
      },
      {
        id: "trade_2",
        symbol: "ETH/USDT",
        side: "SELL",
        entryPrice: 2620,
        exitPrice: 2480,
        quantity: 3,
        pnl: 420,
        pnlPercentage: 5.34,
        fees: 7.86,
        entryTime: "2024-01-14T08:10:00Z",
        exitTime: "2024-01-14T16:30:00Z",
        strategy: "RSI Divergence",
        duration: "8h 20m",
      },
      {
        id: "trade_3",
        symbol: "ADA/USDT",
        side: "BUY",
        entryPrice: 0.485,
        exitPrice: 0.462,
        quantity: 2000,
        pnl: -46,
        pnlPercentage: -4.74,
        fees: 1.94,
        entryTime: "2024-01-13T12:15:00Z",
        exitTime: "2024-01-13T20:40:00Z",
        strategy: "MACD Crossover",
        duration: "8h 25m",
      },
    ];

    setPaperAccount(mockAccount);
    setPositions(mockPositions);
    setTrades(mockTrades);
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((position) => {
          const priceChange =
            (Math.random() - 0.5) * position.currentPrice * 0.01;
          const newPrice = Math.max(0, position.currentPrice + priceChange);

          const pnl =
            position.side === "LONG"
              ? (newPrice - position.entryPrice) * position.quantity
              : (position.entryPrice - newPrice) * position.quantity;

          const pnlPercentage =
            (pnl / (position.entryPrice * position.quantity)) * 100;

          return {
            ...position,
            currentPrice: newPrice,
            unrealizedPnL: pnl,
            unrealizedPnLPercentage: pnlPercentage,
          };
        }),
      );

      // Update account balance based on position changes
      setPaperAccount((prev) => {
        if (!prev) return prev;

        const totalUnrealizedPnL = positions.reduce(
          (sum, pos) => sum + pos.unrealizedPnL,
          0,
        );
        const newBalance =
          prev.initialBalance + prev.totalPnL + totalUnrealizedPnL;

        return {
          ...prev,
          currentBalance: newBalance,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, positions]);

  const resetAccount = () => {
    if (paperAccount) {
      setPaperAccount({
        ...paperAccount,
        currentBalance: paperAccount.initialBalance,
        totalPnL: 0,
        totalPnLPercentage: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      });
      setPositions([]);
      setTrades([]);
    }
  };

  const totalUnrealizedPnL = positions.reduce(
    (sum, pos) => sum + pos.unrealizedPnL,
    0,
  );
  const totalRealizedPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const recentTrades = trades.slice(0, 5);

  if (!paperAccount) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Paper Trading
          </h1>
          <p className="text-gray-300">
            Test strategies with simulated trading environment
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch checked={isSimulating} onCheckedChange={setIsSimulating} />
            <span className="text-sm text-gray-300">Live Simulation</span>
          </div>
          <Button
            variant="outline"
            onClick={resetAccount}
            className="border-gray-600 hover:bg-gray-800 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Account
          </Button>
          <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Account Balance</p>
                <p className="text-2xl font-bold text-white">
                  ${paperAccount.currentBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Initial: ${paperAccount.initialBalance.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p
                  className={`text-2xl font-bold ${paperAccount.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {paperAccount.totalPnL >= 0 ? "+" : ""}$
                  {paperAccount.totalPnL.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {paperAccount.totalPnLPercentage >= 0 ? "+" : ""}
                  {paperAccount.totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-white">
                  {paperAccount.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {paperAccount.winningTrades}W / {paperAccount.losingTrades}L
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-white">
                  {paperAccount.sharpeRatio.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max DD: {paperAccount.maxDrawdown.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-6">
        <TabsList className="bg-[#1A1B23] border-gray-800">
          <TabsTrigger value="positions">
            Open Positions ({positions.length})
          </TabsTrigger>
          <TabsTrigger value="trades">
            Trade History ({trades.length})
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          {positions.map((position) => (
            <Card key={position.id} className="bg-[#1A1B23] border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {position.side === "LONG" ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {position.symbol}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {position.strategy} • {position.side}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${position.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {position.unrealizedPnL >= 0 ? "+" : ""}$
                      {position.unrealizedPnL.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm ${position.unrealizedPnLPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {position.unrealizedPnLPercentage >= 0 ? "+" : ""}
                      {position.unrealizedPnLPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Entry Price</p>
                    <p className="text-sm font-medium text-white">
                      ${position.entryPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Current Price</p>
                    <p className="text-sm font-medium text-white">
                      ${position.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Quantity</p>
                    <p className="text-sm font-medium text-white">
                      {position.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                    <p className="text-sm font-medium text-red-400">
                      {position.stopLoss
                        ? `$${position.stopLoss.toLocaleString()}`
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Take Profit</p>
                    <p className="text-sm font-medium text-green-400">
                      {position.takeProfit
                        ? `$${position.takeProfit.toLocaleString()}`
                        : "None"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0F1015] rounded-lg">
                  <div>
                    <p className="text-xs text-gray-400">Position Value</p>
                    <p className="text-sm font-medium text-white">
                      $
                      {(
                        position.currentPrice * position.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Entry Time</p>
                    <p className="text-sm text-white">
                      {new Date(position.entryTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {positions.length === 0 && (
            <Card className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-8 text-center">
                <TestTube className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No open positions</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start testing strategies to see positions here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          {recentTrades.map((trade) => (
            <Card key={trade.id} className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {trade.pnl >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {trade.symbol} {trade.side}
                      </p>
                      <p className="text-xs text-gray-400">
                        {trade.strategy} • {trade.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs ${trade.pnlPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {trade.pnlPercentage >= 0 ? "+" : ""}
                      {trade.pnlPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400">Entry</p>
                    <p className="text-sm text-white">
                      ${trade.entryPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Exit</p>
                    <p className="text-sm text-white">
                      ${trade.exitPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="text-sm text-white">{trade.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fees</p>
                    <p className="text-sm text-white">
                      ${trade.fees.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1A1B23] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Return</span>
                  <span
                    className={`font-medium ${paperAccount.totalPnLPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {paperAccount.totalPnLPercentage >= 0 ? "+" : ""}
                    {paperAccount.totalPnLPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe Ratio</span>
                  <span className="text-white font-medium">
                    {paperAccount.sharpeRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-red-400 font-medium">
                    {paperAccount.maxDrawdown.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-medium">
                    {paperAccount.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-white font-medium">
                    {paperAccount.totalTrades}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Trade Duration</span>
                  <span className="text-white font-medium">6h 42m</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B23] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Exposure</span>
                  <span className="text-white font-medium">
                    $
                    {positions
                      .reduce(
                        (sum, pos) => sum + pos.currentPrice * pos.quantity,
                        0,
                      )
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unrealized P&L</span>
                  <span
                    className={`font-medium ${totalUnrealizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {totalUnrealizedPnL >= 0 ? "+" : ""}$
                    {totalUnrealizedPnL.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Realized P&L</span>
                  <span
                    className={`font-medium ${totalRealizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {totalRealizedPnL >= 0 ? "+" : ""}$
                    {totalRealizedPnL.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Portfolio Beta</span>
                  <span className="text-white font-medium">1.15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">VaR (95%)</span>
                  <span className="text-red-400 font-medium">-$245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Correlation to BTC</span>
                  <span className="text-white font-medium">0.78</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card className="bg-[#1A1B23] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Strategy Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "RSI Divergence",
                    trades: 12,
                    winRate: 75,
                    pnl: 450,
                    sharpe: 2.1,
                  },
                  {
                    name: "MACD Crossover",
                    trades: 8,
                    winRate: 62.5,
                    pnl: 320,
                    sharpe: 1.8,
                  },
                  {
                    name: "Bollinger Squeeze",
                    trades: 15,
                    winRate: 60,
                    pnl: 280,
                    sharpe: 1.6,
                  },
                  {
                    name: "AI Pattern",
                    trades: 10,
                    winRate: 70,
                    pnl: 200,
                    sharpe: 1.4,
                  },
                ].map((strategy) => (
                  <div
                    key={strategy.name}
                    className="p-4 bg-[#0F1015] rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">
                        {strategy.name}
                      </h4>
                      <Badge className="text-[#30D5C8] bg-[#30D5C8]/10">
                        {strategy.trades} trades
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Win Rate</p>
                        <p className="text-sm font-medium text-white">
                          {strategy.winRate}%
                        </p>
                        <Progress
                          value={strategy.winRate}
                          className="h-1 mt-1"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">P&L</p>
                        <p className="text-sm font-medium text-green-400">
                          +${strategy.pnl}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Sharpe</p>
                        <p className="text-sm font-medium text-white">
                          {strategy.sharpe}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
