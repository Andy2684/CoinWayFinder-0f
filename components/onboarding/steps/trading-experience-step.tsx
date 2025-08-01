"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Target, Shield, Clock, DollarSign, BarChart3 } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface TradingExperienceStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

export function TradingExperienceStep({ data, onNext, isLoading }: TradingExperienceStepProps) {
  const [formData, setFormData] = useState({
    level: data?.tradingExperience?.level || "beginner",
    yearsExperience: data?.tradingExperience?.yearsExperience || 0,
    previousPlatforms: data?.tradingExperience?.previousPlatforms || [],
    tradingGoals: data?.tradingExperience?.tradingGoals || [],
    riskTolerance: data?.tradingExperience?.riskTolerance || "medium",
  })

  const experienceLevels = [
    {
      value: "beginner",
      title: "Beginner",
      description: "New to crypto trading, learning the basics",
      icon: "🌱",
      features: ["Guided tutorials", "Risk management tools", "Educational content"],
    },
    {
      value: "intermediate",
      title: "Intermediate",
      description: "Some trading experience, ready for advanced features",
      icon: "📈",
      features: ["Advanced charting", "Strategy backtesting", "Portfolio analytics"],
    },
    {
      value: "advanced",
      title: "Advanced",
      description: "Experienced trader, need professional tools",
      icon: "🚀",
      features: ["API access", "Custom indicators", "Institutional features"],
    },
  ]

  const platforms = ["Binance", "Coinbase", "Kraken", "Bybit", "KuCoin", "Huobi", "FTX", "Bitfinex", "Other"]

  const goals = [
    { id: "day-trading", label: "Day Trading", icon: "⚡" },
    { id: "swing-trading", label: "Swing Trading", icon: "📊" },
    { id: "long-term", label: "Long-term Investment", icon: "💎" },
    { id: "defi", label: "DeFi & Yield Farming", icon: "🌾" },
    { id: "arbitrage", label: "Arbitrage Trading", icon: "🔄" },
    { id: "portfolio", label: "Portfolio Management", icon: "📈" },
  ]

  const riskLevels = [
    {
      value: "low",
      title: "Conservative",
      description: "Prefer stable, low-risk investments",
      icon: <Shield className="w-5 h-5" />,
      color: "text-green-400 border-green-400",
    },
    {
      value: "medium",
      title: "Moderate",
      description: "Balanced approach to risk and reward",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-yellow-400 border-yellow-400",
    },
    {
      value: "high",
      title: "Aggressive",
      description: "Comfortable with high-risk, high-reward strategies",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-red-400 border-red-400",
    },
  ]

  const handleSubmit = () => {
    onNext({
      tradingExperience: formData,
    })
  }

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      previousPlatforms: prev.previousPlatforms.includes(platform)
        ? prev.previousPlatforms.filter((p) => p !== platform)
        : [...prev.previousPlatforms, platform],
    }))
  }

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      tradingGoals: prev.tradingGoals.includes(goalId)
        ? prev.tradingGoals.filter((g) => g !== goalId)
        : [...prev.tradingGoals, goalId],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Your Trading Experience</h2>
        <p className="text-gray-300">This helps us customize CoinWayFinder to match your skill level and goals</p>
      </div>

      {/* Experience Level */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            What's your trading experience level?
          </h3>
          <RadioGroup
            value={formData.level}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value as any }))}
            className="space-y-3"
          >
            {experienceLevels.map((level) => (
              <div key={level.value} className="flex items-start space-x-3">
                <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                <Label htmlFor={level.value} className="flex-1 cursor-pointer">
                  <Card
                    className={`p-4 transition-colors ${
                      formData.level === level.value
                        ? "bg-blue-500/20 border-blue-500"
                        : "bg-slate-600/50 border-slate-500 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{level.icon}</span>
                          <h4 className="font-medium text-white">{level.title}</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{level.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {level.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Years of Experience */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            How many years have you been trading crypto?
          </h3>
          <Select
            value={formData.yearsExperience.toString()}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, yearsExperience: Number.parseInt(value) }))}
          >
            <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
              <SelectValue placeholder="Select years of experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Less than 1 year</SelectItem>
              <SelectItem value="1">1 year</SelectItem>
              <SelectItem value="2">2 years</SelectItem>
              <SelectItem value="3">3 years</SelectItem>
              <SelectItem value="4">4 years</SelectItem>
              <SelectItem value="5">5+ years</SelectItem>
              <SelectItem value="10">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Previous Platforms */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Which trading platforms have you used? (Optional)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <div
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.previousPlatforms.includes(platform)
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-slate-600/50 border-slate-500 text-gray-300 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.previousPlatforms.includes(platform)} onChange={() => {}} />
                  <span className="text-sm font-medium">{platform}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Goals */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            What are your trading goals? (Select all that apply)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  formData.tradingGoals.includes(goal.id)
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-slate-600/50 border-slate-500 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h4 className="font-medium text-white">{goal.label}</h4>
                  </div>
                  <Checkbox checked={formData.tradingGoals.includes(goal.id)} onChange={() => {}} className="ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Tolerance */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            What's your risk tolerance?
          </h3>
          <RadioGroup
            value={formData.riskTolerance}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, riskTolerance: value as any }))}
            className="space-y-3"
          >
            {riskLevels.map((risk) => (
              <div key={risk.value} className="flex items-start space-x-3">
                <RadioGroupItem value={risk.value} id={risk.value} className="mt-1" />
                <Label htmlFor={risk.value} className="flex-1 cursor-pointer">
                  <Card
                    className={`p-4 transition-colors ${
                      formData.riskTolerance === risk.value
                        ? `bg-opacity-20 border-opacity-100 ${risk.color.replace("text-", "bg-").replace("border-", "border-")}`
                        : "bg-slate-600/50 border-slate-500 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={formData.riskTolerance === risk.value ? risk.color : "text-gray-400"}>
                        {risk.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{risk.title}</h4>
                        <p className="text-sm text-gray-400">{risk.description}</p>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving Experience..." : "Continue to Preferences"}
        </Button>
      </div>
    </div>
  )
}
