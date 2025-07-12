"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  Target,
  Settings,
  Activity,
  Zap,
} from "lucide-react";

export function RiskManagement() {
  const [riskSettings, setRiskSettings] = useState({
    maxDrawdown: 10,
    positionSize: 5,
    stopLoss: true,
    takeProfit: true,
    riskPerTrade: 2,
    maxOpenPositions: 10,
  });

  const riskAlerts = [
    {
      type: "warning",
      title: "High Correlation Detected",
      description: "BTC and ETH positions are highly correlated (0.89)",
      severity: "medium",
      timestamp: "2 hours ago",
    },
    {
      type: "info",
      title: "Drawdown Approaching Limit",
      description: "Current drawdown: 7.2% (Limit: 10%)",
      severity: "low",
      timestamp: "4 hours ago",
    },
    {
      type: "critical",
      title: "Position Size Exceeded",
      description: "SOL position exceeds 5% portfolio limit",
      severity: "high",
      timestamp: "6 hours ago",
    },
  ];

  const riskMetrics = [
    {
      label: "Portfolio Risk Score",
      value: 6.8,
      max: 10,
      color: "text-yellow-400",
    },
    {
      label: "Current Drawdown",
      value: 7.2,
      max: 10,
      color: "text-orange-400",
    },
    {
      label: "Position Concentration",
      value: 35,
      max: 50,
      color: "text-blue-400",
    },
    { label: "Leverage Usage", value: 2.3, max: 5, color: "text-green-400" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "info":
        return <Activity className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">{metric.label}</span>
                  <span className={`font-bold ${metric.color}`}>
                    {metric.value}
                    {metric.max <= 10 ? "" : "%"}
                  </span>
                </div>
                <Progress
                  value={(metric.value / metric.max) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>
                    {metric.max}
                    {metric.max <= 10 ? "" : "%"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Settings */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Risk Settings</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm">
                      Max Drawdown (%)
                    </label>
                    <span className="text-white font-medium">
                      {riskSettings.maxDrawdown}%
                    </span>
                  </div>
                  <Slider
                    value={[riskSettings.maxDrawdown]}
                    onValueChange={(value) =>
                      setRiskSettings({
                        ...riskSettings,
                        maxDrawdown: value[0],
                      })
                    }
                    max={20}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm">
                      Position Size Limit (%)
                    </label>
                    <span className="text-white font-medium">
                      {riskSettings.positionSize}%
                    </span>
                  </div>
                  <Slider
                    value={[riskSettings.positionSize]}
                    onValueChange={(value) =>
                      setRiskSettings({
                        ...riskSettings,
                        positionSize: value[0],
                      })
                    }
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm">
                      Risk Per Trade (%)
                    </label>
                    <span className="text-white font-medium">
                      {riskSettings.riskPerTrade}%
                    </span>
                  </div>
                  <Slider
                    value={[riskSettings.riskPerTrade]}
                    onValueChange={(value) =>
                      setRiskSettings({
                        ...riskSettings,
                        riskPerTrade: value[0],
                      })
                    }
                    max={10}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Stop Loss</p>
                    <p className="text-gray-400 text-sm">
                      Automatic stop loss orders
                    </p>
                  </div>
                  <Switch
                    checked={riskSettings.stopLoss}
                    onCheckedChange={(checked) =>
                      setRiskSettings({ ...riskSettings, stopLoss: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Take Profit</p>
                    <p className="text-gray-400 text-sm">
                      Automatic profit taking
                    </p>
                  </div>
                  <Switch
                    checked={riskSettings.takeProfit}
                    onCheckedChange={(checked) =>
                      setRiskSettings({ ...riskSettings, takeProfit: checked })
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm">
                      Max Open Positions
                    </label>
                    <span className="text-white font-medium">
                      {riskSettings.maxOpenPositions}
                    </span>
                  </div>
                  <Slider
                    value={[riskSettings.maxOpenPositions]}
                    onValueChange={(value) =>
                      setRiskSettings({
                        ...riskSettings,
                        maxOpenPositions: value[0],
                      })
                    }
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Risk Alerts
            </CardTitle>
            <Badge className="bg-red-500/10 text-red-400">
              {riskAlerts.filter((alert) => alert.severity === "high").length}{" "}
              Critical
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium">{alert.title}</h5>
                      <span className="text-xs opacity-70">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">{alert.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              className="border-gray-600 bg-transparent"
            >
              View All Alerts
            </Button>
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90">
              Configure Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-red-400" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span className="text-sm">Stop All Bots</span>
            </Button>

            <Button className="h-16 flex-col bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400">
              <TrendingDown className="w-6 h-6 mb-2" />
              <span className="text-sm">Close Positions</span>
            </Button>

            <Button className="h-16 flex-col bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
              <Target className="w-6 h-6 mb-2" />
              <span className="text-sm">Hedge Portfolio</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
