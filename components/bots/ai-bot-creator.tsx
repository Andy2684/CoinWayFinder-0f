"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  ArrowUpDown,
  Target,
  Sparkles,
  Shield,
  Settings,
} from "lucide-react";
import {
  aiBotStrategies,
  calculateAIEstimatedReturns,
  type AIBotStrategy,
} from "@/lib/ai-bot-strategies";
import { toast } from "@/hooks/use-toast";

export function AIBotCreator() {
  const [open, setOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] =
    useState<AIBotStrategy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [botConfig, setBotConfig] = useState({
    name: "",
    investment: 1000,
    aiOptimization: true,
    parameters: {} as Record<string, any>,
    riskManagement: {
      stopLoss: 5,
      takeProfit: 15,
      maxDrawdown: 10,
      positionSizing: "ai-optimized" as const,
    },
    notifications: {
      email: true,
      telegram: false,
      discord: false,
    },
  });

  const getStrategyIcon = (category: string) => {
    switch (category) {
      case "ai-dca":
        return TrendingUp;
      case "ai-scalping":
        return Zap;
      case "ai-long-short":
        return ArrowUpDown;
      case "ai-trend":
        return BarChart3;
      case "ai-grid":
        return Target;
      case "ai-arbitrage":
        return ArrowUpDown;
      default:
        return Bot;
    }
  };

  const getStrategyColor = (category: string) => {
    switch (category) {
      case "ai-dca":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "ai-scalping":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "ai-long-short":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ai-trend":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "ai-grid":
        return "bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/20";
      case "ai-arbitrage":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/10 text-green-400";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400";
      case "Medium-High":
        return "bg-orange-500/10 text-orange-400";
      case "High":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const handleCreateBot = async () => {
    if (!selectedStrategy) return;

    setIsCreating(true);

    const config = {
      strategyId: selectedStrategy.id,
      name: botConfig.name,
      investment: botConfig.investment,
      parameters: botConfig.parameters,
      aiOptimization: botConfig.aiOptimization,
      riskManagement: botConfig.riskManagement,
      notifications: botConfig.notifications,
    };

    try {
      const response = await fetch("/api/bots/ai-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "AI Bot Created Successfully!",
          description: `Your ${selectedStrategy.name} bot "${botConfig.name}" is now active.`,
        });
        setOpen(false);
        // Reset form
        setBotConfig({
          name: "",
          investment: 1000,
          aiOptimization: true,
          parameters: {},
          riskManagement: {
            stopLoss: 5,
            takeProfit: 15,
            maxDrawdown: 10,
            positionSizing: "ai-optimized",
          },
          notifications: {
            email: true,
            telegram: false,
            discord: false,
          },
        });
        setSelectedStrategy(null);
      } else {
        toast({
          title: "Failed to Create Bot",
          description:
            result.error || "An error occurred while creating your AI bot.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create AI bot:", error);
      toast({
        title: "Network Error",
        description: "Failed to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const estimatedReturns = selectedStrategy
    ? calculateAIEstimatedReturns(
        selectedStrategy.id,
        botConfig.investment,
        "1y",
        botConfig.aiOptimization,
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#30D5C8] to-[#4F46E5] hover:from-[#30D5C8]/90 hover:to-[#4F46E5]/90 text-white font-semibold">
          <Brain className="w-4 h-4 mr-2" />
          Create AI Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Create AI-Powered Trading Bot
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your AI trading bot with advanced machine learning
            strategies
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger
              value="strategy"
              className="text-gray-300 data-[state=active]:text-white"
            >
              AI Strategy
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="text-gray-300 data-[state=active]:text-white"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="ai-params"
              className="text-gray-300 data-[state=active]:text-white"
            >
              AI Parameters
            </TabsTrigger>
            <TabsTrigger
              value="risk"
              className="text-gray-300 data-[state=active]:text-white"
            >
              Risk Management
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-gray-300 data-[state=active]:text-white"
            >
              Preview
            </TabsTrigger>
          </TabsList>

          {/* AI Strategy Selection */}
          <TabsContent value="strategy" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {aiBotStrategies.map((strategy) => {
                const IconComponent = getStrategyIcon(strategy.category);
                return (
                  <Card
                    key={strategy.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedStrategy?.id === strategy.id
                        ? "border-[#30D5C8] bg-[#30D5C8]/5 shadow-lg"
                        : "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/70"
                    }`}
                    onClick={() => {
                      setSelectedStrategy(strategy);
                      setBotConfig((prev) => ({ ...prev, parameters: {} }));
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStrategyColor(strategy.category)}`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg flex items-center">
                              {strategy.name}
                              <Sparkles className="w-4 h-4 ml-2 text-[#30D5C8]" />
                            </CardTitle>
                            <p className="text-sm text-gray-400 mt-1">
                              {strategy.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#30D5C8] font-semibold">
                            {strategy.successRate}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Success Rate
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getRiskColor(strategy.riskLevel)}>
                          {strategy.riskLevel} Risk
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          {strategy.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-[#30D5C8]/30 text-[#30D5C8]"
                        >
                          AI-Powered
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Min Investment:</span>
                          <span className="text-white font-semibold ml-2">
                            ${strategy.minInvestment}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Avg Return:</span>
                          <span className="text-[#30D5C8] font-semibold ml-2">
                            {strategy.avgReturn}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-[#30D5C8] mb-2">
                          🤖 AI Features
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {strategy.aiFeatures
                            .slice(0, 3)
                            .map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center text-xs text-gray-300"
                              >
                                <div className="w-1 h-1 bg-[#30D5C8] rounded-full mr-2"></div>
                                {feature}
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Basic Configuration */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="botName" className="text-white">
                    Bot Name
                  </Label>
                  <Input
                    id="botName"
                    placeholder="My AI Trading Bot"
                    value={botConfig.name}
                    onChange={(e) =>
                      setBotConfig({ ...botConfig, name: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="investment" className="text-white">
                    Initial Investment ($)
                  </Label>
                  <Input
                    id="investment"
                    type="number"
                    value={botConfig.investment}
                    onChange={(e) =>
                      setBotConfig({
                        ...botConfig,
                        investment: Number(e.target.value),
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="aiOptimization" className="text-white">
                    Enable AI Optimization
                  </Label>
                  <Switch
                    id="aiOptimization"
                    checked={botConfig.aiOptimization}
                    onCheckedChange={(checked) =>
                      setBotConfig({ ...botConfig, aiOptimization: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-[#30D5C8]" />
                      AI Enhancement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Pattern Recognition
                        </span>
                        <span className="text-[#30D5C8]">Advanced</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Market Analysis</span>
                        <span className="text-[#30D5C8]">Real-time</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Risk Optimization</span>
                        <span className="text-[#30D5C8]">Dynamic</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {estimatedReturns && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">
                        Estimated Returns (1 Year)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Conservative:</span>
                        <span className="text-green-400">
                          +${estimatedReturns.conservative.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Realistic:</span>
                        <span className="text-[#30D5C8]">
                          +${estimatedReturns.realistic.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Optimistic:</span>
                        <span className="text-blue-400">
                          +${estimatedReturns.optimistic.toFixed(0)}
                        </span>
                      </div>
                      {botConfig.aiOptimization && (
                        <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
                          <span className="text-[#30D5C8]">AI Bonus:</span>
                          <span className="text-[#30D5C8]">
                            +${estimatedReturns.aiBonus.toFixed(0)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI Parameters */}
          <TabsContent value="ai-params" className="space-y-6">
            {selectedStrategy ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-[#30D5C8]" />
                      AI Models Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStrategy.aiModels.map((model, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-2 h-2 bg-[#30D5C8] rounded-full"></div>
                          <span className="text-gray-300 text-sm">{model}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {selectedStrategy.parameters.map((param) => (
                    <div key={param.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm">
                          {param.name}
                        </Label>
                        {param.aiOptimized && (
                          <Badge
                            variant="outline"
                            className="border-[#30D5C8]/30 text-[#30D5C8] text-xs"
                          >
                            AI Optimized
                          </Badge>
                        )}
                      </div>

                      {param.type === "percentage" && (
                        <div className="space-y-2">
                          <Slider
                            value={[
                              botConfig.parameters[param.key] ||
                                param.defaultValue,
                            ]}
                            onValueChange={(value) =>
                              setBotConfig((prev) => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.key]: value[0],
                                },
                              }))
                            }
                            max={param.max || 100}
                            min={param.min || 0}
                            step={param.step || 1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{param.min || 0}%</span>
                            <span className="text-[#30D5C8]">
                              {botConfig.parameters[param.key] ||
                                param.defaultValue}
                              %
                            </span>
                            <span>{param.max || 100}%</span>
                          </div>
                        </div>
                      )}

                      {param.type === "number" && (
                        <Input
                          type="number"
                          value={
                            botConfig.parameters[param.key] ||
                            param.defaultValue
                          }
                          onChange={(e) =>
                            setBotConfig((prev) => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                [param.key]: Number(e.target.value),
                              },
                            }))
                          }
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      )}

                      {param.type === "select" && (
                        <Select
                          value={
                            botConfig.parameters[param.key] ||
                            param.defaultValue
                          }
                          onValueChange={(value) =>
                            setBotConfig((prev) => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                [param.key]: value,
                              },
                            }))
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {param.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {param.type === "boolean" && (
                        <Switch
                          checked={
                            botConfig.parameters[param.key] ??
                            param.defaultValue
                          }
                          onCheckedChange={(checked) =>
                            setBotConfig((prev) => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                [param.key]: checked,
                              },
                            }))
                          }
                        />
                      )}

                      <p className="text-xs text-gray-400">
                        {param.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  Select an AI strategy to configure parameters
                </p>
              </div>
            )}
          </TabsContent>

          {/* Risk Management */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-red-400" />
                    Risk Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">
                      Stop Loss: {botConfig.riskManagement.stopLoss}%
                    </Label>
                    <Slider
                      value={[botConfig.riskManagement.stopLoss]}
                      onValueChange={(value) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            stopLoss: value[0],
                          },
                        }))
                      }
                      max={20}
                      min={1}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-white">
                      Take Profit: {botConfig.riskManagement.takeProfit}%
                    </Label>
                    <Slider
                      value={[botConfig.riskManagement.takeProfit]}
                      onValueChange={(value) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            takeProfit: value[0],
                          },
                        }))
                      }
                      max={50}
                      min={2}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-white">
                      Max Drawdown: {botConfig.riskManagement.maxDrawdown}%
                    </Label>
                    <Slider
                      value={[botConfig.riskManagement.maxDrawdown]}
                      onValueChange={(value) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            maxDrawdown: value[0],
                          },
                        }))
                      }
                      max={25}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Position Sizing</Label>
                    <Select
                      value={botConfig.riskManagement.positionSizing}
                      onValueChange={(
                        value: "fixed" | "kelly" | "ai-optimized",
                      ) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            positionSizing: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="fixed">Fixed Size</SelectItem>
                        <SelectItem value="kelly">Kelly Criterion</SelectItem>
                        <SelectItem value="ai-optimized">
                          AI Optimized
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Email Alerts</Label>
                    <Switch
                      checked={botConfig.notifications.email}
                      onCheckedChange={(checked) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Telegram Alerts</Label>
                    <Switch
                      checked={botConfig.notifications.telegram}
                      onCheckedChange={(checked) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            telegram: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Discord Alerts</Label>
                    <Switch
                      checked={botConfig.notifications.discord}
                      onCheckedChange={(checked) =>
                        setBotConfig((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            discord: checked,
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-6">
            {selectedStrategy ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Bot Configuration Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strategy:</span>
                      <span className="text-white">
                        {selectedStrategy.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Investment:</span>
                      <span className="text-white">
                        ${botConfig.investment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Optimization:</span>
                      <span
                        className={
                          botConfig.aiOptimization
                            ? "text-[#30D5C8]"
                            : "text-gray-400"
                        }
                      >
                        {botConfig.aiOptimization ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Level:</span>
                      <Badge
                        className={getRiskColor(selectedStrategy.riskLevel)}
                      >
                        {selectedStrategy.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-[#30D5C8]">
                        {selectedStrategy.successRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {estimatedReturns && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Performance Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400 text-sm">
                              Conservative
                            </span>
                            <span className="text-green-400">
                              +${estimatedReturns.conservative.toFixed(0)}
                            </span>
                          </div>
                          <Progress value={30} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400 text-sm">
                              Realistic
                            </span>
                            <span className="text-[#30D5C8]">
                              +${estimatedReturns.realistic.toFixed(0)}
                            </span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400 text-sm">
                              Optimistic
                            </span>
                            <span className="text-blue-400">
                              +${estimatedReturns.optimistic.toFixed(0)}
                            </span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                      </div>

                      {botConfig.aiOptimization && (
                        <div className="border-t border-gray-700 pt-3">
                          <div className="flex justify-between">
                            <span className="text-[#30D5C8] text-sm font-medium">
                              AI Enhancement Bonus
                            </span>
                            <span className="text-[#30D5C8] font-bold">
                              +${estimatedReturns.aiBonus.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  Complete the configuration to see preview
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBot}
            disabled={!selectedStrategy || !botConfig.name || isCreating}
            className="bg-gradient-to-r from-[#30D5C8] to-[#4F46E5] hover:from-[#30D5C8]/90 hover:to-[#4F46E5]/90 text-white font-semibold disabled:opacity-50"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isCreating ? "Creating..." : "Create AI Bot"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
