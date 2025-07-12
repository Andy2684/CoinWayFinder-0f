"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

interface CreateSignalDialogProps {
  children: React.ReactNode;
}

export function CreateSignalDialog({ children }: CreateSignalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    type: "",
    strategy: "",
    exchange: "",
    timeframe: "",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    confidence: [75],
    riskLevel: "",
    analysis: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateRiskReward = () => {
    const entry = Number.parseFloat(formData.entryPrice);
    const target = Number.parseFloat(formData.targetPrice);
    const stop = Number.parseFloat(formData.stopLoss);

    if (!entry || !target || !stop) return null;

    const reward = Math.abs(target - entry);
    const risk = Math.abs(entry - stop);
    const ratio = reward / risk;

    return {
      reward: reward.toFixed(2),
      risk: risk.toFixed(2),
      ratio: ratio.toFixed(2),
    };
  };

  const riskReward = calculateRiskReward();

  const handleSubmit = () => {
    // Here you would typically send the data to your API
    console.log("Creating signal:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      symbol: "",
      type: "",
      strategy: "",
      exchange: "",
      timeframe: "",
      entryPrice: "",
      targetPrice: "",
      stopLoss: "",
      confidence: [75],
      riskLevel: "",
      analysis: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-[#1A1B23] border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#30D5C8]" />
            Create New Signal
          </DialogTitle>
          <DialogDescription>
            Set up a new trading signal with detailed parameters and AI
            analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Select
                value={formData.symbol}
                onValueChange={(value) => updateField("symbol", value)}
              >
                <SelectTrigger className="bg-[#0F1015] border-gray-700">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                  <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                  <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
                  <SelectItem value="MATIC/USDT">MATIC/USDT</SelectItem>
                  <SelectItem value="LINK/USDT">LINK/USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Signal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateField("type", value)}
              >
                <SelectTrigger className="bg-[#0F1015] border-gray-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      BUY
                    </div>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      SELL
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strategy">Strategy</Label>
              <Select
                value={formData.strategy}
                onValueChange={(value) => updateField("strategy", value)}
              >
                <SelectTrigger className="bg-[#0F1015] border-gray-700">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trend Following">
                    Trend Following
                  </SelectItem>
                  <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                  <SelectItem value="Breakout">Breakout</SelectItem>
                  <SelectItem value="Support/Resistance">
                    Support/Resistance
                  </SelectItem>
                  <SelectItem value="Momentum">Momentum</SelectItem>
                  <SelectItem value="Scalping">Scalping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exchange">Exchange</Label>
              <Select
                value={formData.exchange}
                onValueChange={(value) => updateField("exchange", value)}
              >
                <SelectTrigger className="bg-[#0F1015] border-gray-700">
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Binance">Binance</SelectItem>
                  <SelectItem value="Bybit">Bybit</SelectItem>
                  <SelectItem value="KuCoin">KuCoin</SelectItem>
                  <SelectItem value="OKX">OKX</SelectItem>
                  <SelectItem value="Bitget">Bitget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => updateField("timeframe", value)}
              >
                <SelectTrigger className="bg-[#0F1015] border-gray-700">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15M">15 Minutes</SelectItem>
                  <SelectItem value="30M">30 Minutes</SelectItem>
                  <SelectItem value="1H">1 Hour</SelectItem>
                  <SelectItem value="2H">2 Hours</SelectItem>
                  <SelectItem value="4H">4 Hours</SelectItem>
                  <SelectItem value="1D">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) => updateField("riskLevel", value)}
              >
                <SelectTrigger className="bg-[#0F1015] border-gray-700">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    <Badge className="text-green-400 bg-green-400/10">
                      LOW
                    </Badge>
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <Badge className="text-yellow-400 bg-yellow-400/10">
                      MEDIUM
                    </Badge>
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <Badge className="text-red-400 bg-red-400/10">HIGH</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Price Levels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Price Levels</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.entryPrice}
                  onChange={(e) => updateField("entryPrice", e.target.value)}
                  className="bg-[#0F1015] border-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="targetPrice">Target Price</Label>
                <Input
                  id="targetPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.targetPrice}
                  onChange={(e) => updateField("targetPrice", e.target.value)}
                  className="bg-[#0F1015] border-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  placeholder="0.00"
                  value={formData.stopLoss}
                  onChange={(e) => updateField("stopLoss", e.target.value)}
                  className="bg-[#0F1015] border-gray-700"
                />
              </div>
            </div>

            {/* Risk/Reward Calculator */}
            {riskReward && (
              <Card className="bg-[#0F1015] border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-[#30D5C8]" />
                    <h4 className="font-medium text-white">
                      Risk/Reward Analysis
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Potential Reward</p>
                      <p className="font-medium text-green-400">
                        ${riskReward.reward}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Potential Risk</p>
                      <p className="font-medium text-red-400">
                        ${riskReward.risk}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">R:R Ratio</p>
                      <p className="font-medium text-[#30D5C8]">
                        1:{riskReward.ratio}
                      </p>
                    </div>
                  </div>
                  {Number.parseFloat(riskReward.ratio) < 1.5 && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <p className="text-xs text-yellow-400">
                        Consider improving risk/reward ratio (recommended: 1:1.5
                        or better)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Confidence Level */}
          <div>
            <Label className="text-white mb-3 block">
              Confidence Level: {formData.confidence[0]}%
            </Label>
            <Slider
              value={formData.confidence}
              onValueChange={(value) => updateField("confidence", value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* AI Analysis */}
          <div>
            <Label htmlFor="analysis">AI Analysis & Reasoning</Label>
            <Textarea
              id="analysis"
              placeholder="Provide detailed analysis and reasoning for this signal..."
              value={formData.analysis}
              onChange={(e) => updateField("analysis", e.target.value)}
              className="bg-[#0F1015] border-gray-700 min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
              disabled={
                !formData.symbol || !formData.type || !formData.entryPrice
              }
            >
              Create Signal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
