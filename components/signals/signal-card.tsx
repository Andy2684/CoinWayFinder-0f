"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Signal {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  strategy: string;
  exchange: string;
  timeframe: string;
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  progress: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  aiAnalysis: string;
  createdAt: string;
  status: "ACTIVE" | "COMPLETED" | "STOPPED";
}

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400 bg-green-400/10";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-400/10";
      case "HIGH":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "BUY"
      ? "text-green-400 bg-green-400/10"
      : "text-red-400 bg-red-400/10";
  };

  const copySignal = () => {
    const signalText = `${signal.symbol} ${signal.type} Signal
Entry: $${signal.entryPrice}
Target: $${signal.targetPrice}
Stop Loss: $${signal.stopLoss}
Confidence: ${signal.confidence}%
Strategy: ${signal.strategy}`;

    navigator.clipboard.writeText(signalText);
  };

  return (
    <Card className="bg-[#1A1B23] border-gray-800 hover:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {signal.type === "BUY" ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {signal.symbol}
              </h3>
            </div>
            <Badge
              className={cn("text-xs font-medium", getTypeColor(signal.type))}
            >
              {signal.type}
            </Badge>
            <Badge
              className={cn(
                "text-xs font-medium",
                getRiskColor(signal.riskLevel),
              )}
            >
              {signal.riskLevel}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[#30D5C8] border-[#30D5C8]/30"
            >
              {signal.confidence}% confidence
            </Badge>
            <Button variant="ghost" size="sm" onClick={copySignal}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {signal.timeframe}
          </span>
          <span>{signal.exchange}</span>
          <span>{signal.strategy}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Entry Price</p>
            <p className="text-sm font-medium text-white">
              ${signal.entryPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Price</p>
            <p className="text-sm font-medium text-white">
              ${signal.currentPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Target</p>
            <p className="text-sm font-medium text-green-400">
              ${signal.targetPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
            <p className="text-sm font-medium text-red-400">
              ${signal.stopLoss.toLocaleString()}
            </p>
          </div>
        </div>

        {/* P&L and Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">P&L</p>
                <p
                  className={cn(
                    "text-sm font-medium",
                    signal.pnl >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {signal.pnl >= 0 ? "+" : ""}${signal.pnl.toFixed(2)} (
                  {signal.pnlPercentage >= 0 ? "+" : ""}
                  {signal.pnlPercentage.toFixed(2)}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Progress to Target</p>
                <p className="text-sm font-medium text-white">
                  {signal.progress}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{signal.progress}%</span>
            </div>
            <Progress value={signal.progress} className="h-2" />
          </div>
        </div>

        {/* AI Analysis Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto text-left"
            >
              <span className="text-sm text-gray-400">AI Analysis</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="bg-[#0F1015] rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-300 leading-relaxed">
                {signal.aiAnalysis}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
