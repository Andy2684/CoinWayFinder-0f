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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface Holding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  percentage: number;
  pnl: number;
  pnlPercentage: number;
  avgBuyPrice: number;
  currentPrice: number;
}

interface PerformanceData {
  date: string;
  value: number;
  pnl: number;
}

interface RiskMetric {
  name: string;
  value: number;
  description: string;
  status: "good" | "warning" | "danger";
}

export function PortfolioAnalysis() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockHoldings: Holding[] = [
        {
          symbol: "BTC",
          name: "Bitcoin",
          amount: 0.5,
          value: 21500,
          percentage: 45.2,
          pnl: 2500,
          pnlPercentage: 13.2,
          avgBuyPrice: 38000,
          currentPrice: 43000,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          amount: 8.2,
          value: 18450,
          percentage: 38.7,
          pnl: 1850,
          pnlPercentage: 11.1,
          avgBuyPrice: 2025,
          currentPrice: 2250,
        },
        {
          symbol: "ADA",
          name: "Cardano",
          amount: 5000,
          value: 3250,
          percentage: 6.8,
          pnl: -450,
          pnlPercentage: -12.2,
          avgBuyPrice: 0.74,
          currentPrice: 0.65,
        },
        {
          symbol: "SOL",
          name: "Solana",
          amount: 45,
          value: 2880,
          percentage: 6.0,
          pnl: 380,
          pnlPercentage: 15.2,
          avgBuyPrice: 55.5,
          currentPrice: 64,
        },
        {
          symbol: "DOT",
          name: "Polkadot",
          amount: 280,
          value: 1540,
          percentage: 3.3,
          pnl: -160,
          pnlPercentage: -9.4,
          avgBuyPrice: 6.07,
          currentPrice: 5.5,
        },
      ];

      const mockPerformance: PerformanceData[] = Array.from(
        { length: 30 },
        (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          value: 45000 + Math.random() * 10000 - 5000,
          pnl: -2000 + Math.random() * 8000,
        }),
      );

      const mockRiskMetrics: RiskMetric[] = [
        {
          name: "Portfolio Volatility",
          value: 24.5,
          description: "Annualized volatility of portfolio",
          status: "warning",
        },
        {
          name: "Sharpe Ratio",
          value: 1.85,
          description: "Risk-adjusted return measure",
          status: "good",
        },
        {
          name: "Max Drawdown",
          value: -18.2,
          description: "Maximum peak-to-trough decline",
          status: "warning",
        },
        {
          name: "Beta (vs BTC)",
          value: 0.92,
          description: "Portfolio correlation with Bitcoin",
          status: "good",
        },
        {
          name: "Diversification Score",
          value: 72,
          description: "Portfolio diversification rating",
          status: "good",
        },
      ];

      setHoldings(mockHoldings);
      setPerformanceData(mockPerformance);
      setRiskMetrics(mockRiskMetrics);
      setTotalValue(
        mockHoldings.reduce((sum, holding) => sum + holding.value, 0),
      );
      setTotalPnL(mockHoldings.reduce((sum, holding) => sum + holding.pnl, 0));
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const COLORS = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const getRiskColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRiskBg = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100";
      case "warning":
        return "bg-yellow-100";
      case "danger":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of your crypto portfolio
          </p>
        </div>
        <Button
          onClick={fetchPortfolioData}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ${Math.abs(totalPnL).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <p className="text-xs text-muted-foreground">Different assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Medium</div>
            <p className="text-xs text-muted-foreground">Portfolio risk</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Asset distribution by value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={holdings}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ symbol, percentage }) =>
                      `${symbol} ${percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {holdings.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Value",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>30-day portfolio value and P&L</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
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
                      `$${value.toLocaleString()}`,
                      name === "value" ? "Portfolio Value" : "P&L",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Holdings Breakdown</CardTitle>
            <CardDescription>
              Detailed view of your crypto holdings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {holdings.map((holding, index) => (
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
                    <div className="font-medium">{holding.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {holding.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {holding.amount} @ ${holding.currentPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${holding.value.toLocaleString()}
                  </div>
                  <div
                    className={`text-sm ${holding.pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {holding.pnl >= 0 ? "+" : ""}${holding.pnl.toLocaleString()}{" "}
                    ({holding.pnlPercentage.toFixed(1)}%)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {holding.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>
              Portfolio risk analysis and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{metric.name}</div>
                  <Badge
                    variant="outline"
                    className={`${getRiskBg(metric.status)} ${getRiskColor(metric.status)} border-current`}
                  >
                    {metric.status}
                  </Badge>
                </div>
                <div
                  className={`text-2xl font-bold ${getRiskColor(metric.status)}`}
                >
                  {metric.value}
                  {metric.name.includes("Ratio") || metric.name.includes("Beta")
                    ? ""
                    : metric.name.includes("Score")
                      ? "/100"
                      : "%"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {metric.description}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
